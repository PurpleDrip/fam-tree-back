import { NextFunction, Request, Response } from "express";
import bcrypt from "bcryptjs"

import User from "../models/userModel";
import { getTreeByID } from "../services/treeService";
import { ITree } from "../models/treeModel";

export const registerUser=async (req:Request,res:Response,next:NextFunction):Promise<void>=>{
    const { username, gender, dob, password, treeId, mode } = req.body;

    let data: {
        id: string;
        treeId: string;
        treeName: string;
        nodes: ITree['nodes'];
        edges: ITree['edges'];
    } = { 
        id: "", 
        treeId: treeId || "", 
        treeName: "", 
        nodes: [], 
        edges: [] 
    };

    try{
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            res.status(400).json({ success: false, message: "Username already exists" });
            return ;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        if (treeId) {
            const tree:ITree|null= await getTreeByID(treeId);
            if (!tree) {
                res.status(400).json({ message: "Tree not found" });
                return ;
            } 

            data.treeId = treeId;
            data.treeName = tree.name;
            data.nodes = tree.nodes || [];
            data.edges = tree.edges || [];
        }

        const newUser = new User({ 
            mode, 
            username,
            gender,
            dob,
            password: hashedPassword,
            treeId: data.treeId || null, 
            treeName: data.treeName || "" 
        });

        data.id = newUser._id.toString();
        res.locals.data = data;
        res.locals.newUser = newUser;
        
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
                nodes: ITree['nodes'];
                edges: ITree['edges'] 
            }= {
                id: user._id.toString(),
                treeId: user.treeId.toString(),
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
