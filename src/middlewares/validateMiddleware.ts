import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";
import Node from "../models/nodeModel";

const TOKEN_NAME = process.env.TOKEN_NAME as string;

export const validateUser=(req:Request,res:Response,next:NextFunction):void=>{
    const token = req.body[TOKEN_NAME] || req.cookies[TOKEN_NAME];

    if (!token) {
        res.status(401).json({ message: "No tokens were found.", success: false });
        return;
    }

    let id: string;
    let treeId: string;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string, treeId: string };
        id = decoded.userId;
        treeId = decoded.treeId;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            res.status(400).json({ message: "Invalid Object Id" });
            return;
        }        

        res.locals.cookieData={
            id,
            treeId
        };

        return next();
    } catch (err) {
        res.status(401).json({ message: "Invalid token", error: (err as Error).message });
        return;
    }

}

export const validateCookie=(req:Request,res:Response,next:NextFunction):void=>{
    const token = req.body[TOKEN_NAME] || req.cookies[TOKEN_NAME];

    if (!token) {
        res.status(401).json({ message: "No tokens were found.", success: false });
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string, treeId: string };

        if(!decoded){
            res.status(401).json({ message: "Couldn't decode the token", success: false });
            return;
        }

        return next();
    } catch (err) {
        res.status(401).json({ message: "Invalid token", error: (err as Error).message });
        return;
    }
}

export const validateFiles=(req:Request,res:Response,next:NextFunction) :void=>{
    if(Array.isArray(req.files) && req.files.length > 10){
        res.status(400).json({message:"Can upload a maximum of 10 images per request.",success:false});
        return 
    }
    next();
}

export const validateNode=async (req:Request,res:Response,next:NextFunction) : Promise<void> =>{
    const {override,name}=req.body;

    if(!override){
        try{
            const node=await Node.find({name})

            if(node){
                res.status(400).json({success:false,message:"A node with this name already exists."});
                return
            }
        }catch(err){
            res.status(500).json({ success: false, message: "Error creating node" });
            return;
        }
    }
    next();
}