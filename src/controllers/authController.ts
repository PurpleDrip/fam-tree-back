import { NextFunction, Request, Response } from "express";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

import User from "../models/userModel";
import { getTreeByID } from "../services/treeService";
import { ITree } from "../models/treeModel";
import redis from "../config/redis";
import { INode } from "../models/nodeModel";

export const registerUser=async (req:Request,res:Response,next:NextFunction):Promise<void>=>{
    const { username, gender, dob, password, treeId, mode } = req.body;

    let treeName;

    try{
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            res.status(400).json({ success: false, message: "Username already exists" });
            return ;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        if (treeId) {
            const tree= await getTreeByID(treeId as string);
            if (!tree) {
                res.status(400).json({ message: "Tree not found" });
                return ;
            }
            
            treeName=tree?.name;
        }

        const newUser = new User({ 
            mode, 
            username,
            gender,
            dob,
            password: hashedPassword,
            treeId, 
            treeName: treeName || "",
        });

        await newUser.save();
        
        res.locals.data.treeId=treeId||"";
        res.locals.data.userId=newUser.id;
        
        return next(); 

    } catch (error) {
        next(error);
    }
}

export const loginUser=async (req:Request,res:Response,next:NextFunction):Promise<void> =>{
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });
        if (!user) {
            res.status(404).json({ success: false, message: "User not found" });
            return 
        }

        const isMatch =await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(400).json({ success: false, message: "Invalid credentials" });
            return 
        }

        let data:{id: string;
                treeId: string;
                treeName: string;
                nodes: Array<INode>;
                edges: ITree['edges'] 
            }= {
                id: user._id.toString(),
                treeId: user.treeId?.toString(),
                treeName: user.treeName,
                nodes: [],
                edges: [],
            };

        if (user.treeId) {
            try {
                const tree = await getTreeByID(user.treeId.toString());
                if (!tree) {
                    res.status(400).json({ message: "Tree not found" });
                    return 
                }
                data.nodes = tree.nodes || [];
                data.edges = tree.edges || [];
            } catch (error) {
                res.status(500).json({ message: "Error fetching tree" });
                return 
            }
        }
        res.locals.data = data;
        return next();

    } catch (error) {
        console.error("Error logging in:", error);
        res.status(500).json({ success: false, message: "Error logging in" });
        return 
    }
}

export const clearCookies = async (req: Request, res: Response): Promise<void> => {
    try {
        const TOKEN_NAME = process.env.TOKEN_NAME as string;
        const token = req.body[TOKEN_NAME] || req.cookies[TOKEN_NAME];

        // If no token, respond early
        if (!token) {
            res.status(400).json({ message: "No token provided" });
            return 
        }

        // Clear cookie
        res.clearCookie(TOKEN_NAME);

        let treeId: string | undefined;
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { treeId: string };
            treeId = decoded.treeId;
        } catch (err: unknown) {
            const error = err as { message: string };
            res.status(401).json({ message: "Invalid token", error: error.message });
            return 
        }

        // If treeId is found, delete from Redis
        if (treeId) {
            await redis.del(`session:tree:${treeId}`);
        }

        res.status(200).json({ message: "Cookies removed successfully" });
        return 
    } catch (error: unknown) {
        const err = error as { message: string };
        res.status(500).json({ message: "Error clearing cookies", error: err.message });
        return 
    }
};