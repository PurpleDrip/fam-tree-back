import { NextFunction, Request, Response } from "express";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

import Tree from "../models/treeModel";

export const registerTree=async (req:Request,res:Response,next:NextFunction):Promise<void>=>{
    const { treeName,password,adminPassword,owner } = req.body;

    try{
        const existingUser = await Tree.findOne({ treeName });
        if (existingUser) {
            res.status(400).json({ success: false, message: "Tree with this name already exists" });
            return ;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const hashedAdminPassword=await bcrypt.hash(adminPassword,10);


        const newTree = new Tree({  
            treeName,
            password: hashedPassword,
            adminPassword: hashedAdminPassword,
            owner,
            nodes:[],
            edges:[]
        });

        await newTree.save();
        
        res.locals.data={
            treeId:newTree.id,
            treeName,
            type:"admin"
        }
        
        next(); 

        res.status(201).json({message:"Registered user successfully",success:true,data:{
            type:"admin",
            treeName,
            treeId:newTree.id
        }});
        return;

    } catch (error) {
        console.log(error)
        res.status(500).json({message:"Error registering Tree",success:false})
    }
}

export const loginTree=async (req:Request,res:Response,next:NextFunction):Promise<void> =>{
    try {
        const { treeName, password,adminPassword } = req.body;
        let isMatch,type;

        const tree = await Tree.findOne({ treeName });
        if (!tree) {
            res.status(404).json({ success: false, message: "Tree not found" });
            return 
        }

        if(adminPassword){
            isMatch=await bcrypt.compare(adminPassword, tree.adminPassword);
            type="admin";
        }else{
            isMatch =await bcrypt.compare(password, tree.password);
            type="user";
        }

        if (!isMatch) {
            res.status(400).json({ success: false, message: "Invalid credentials" });
            return 
        }

        res.locals.data={
            treeId:tree.id,
            treeName,
            type
        }


        next();
        res.status(200).json({message:"Login successfully",success:true,data:{
            type,
            treeName,
            treeId:tree.id,
        }});
        return ;

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

        if (!token) {
            res.status(400).json({ message: "No token provided" });
            return 
        }

        res.clearCookie(TOKEN_NAME);

        res.status(204).json({ message: "Cookies removed successfully" });
        return 
    } catch (error: unknown) {
        const err = error as { message: string };
        res.status(500).json({ message: "Error clearing cookies", error: err.message });
        return 
    }
};

export const setCookie = async (req:Request, res:Response) :Promise<void>=> {
    try {
        const { treeName,treeId,type } = res.locals.data;


        const token = jwt.sign({ treeName,treeId,type}, process.env.JWT_SECRET as string, { expiresIn: "1d" });

        res.cookie(process.env.TOKEN_NAME as string, token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000 ,
        });

        return ;
    } catch (error: unknown) {
        const err = error as { message: string };
        console.log(err);
        res.status(500).json({ message: "Error setting cookie", error: err.message });
        return ;
    }
};