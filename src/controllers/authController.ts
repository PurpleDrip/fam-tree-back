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
