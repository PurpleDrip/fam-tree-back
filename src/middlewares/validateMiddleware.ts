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

    let treeName: string;
    let treeId: string;
    let type:string;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { treeName: string, treeId: string,type:string };
        treeName = decoded.treeName;
        treeId = decoded.treeId;
        type=decoded.type;

        if (!mongoose.Types.ObjectId.isValid(treeId)) {
            res.status(400).json({ message: "Invalid Object Id" });
            return;
        }        

        res.locals.cookieData={
            treeName,
            treeId
        };

        res.status(200).json({message:"Token validated",success:true,data:{
            treeName,
            treeId,
            type
        }})
        return;
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

export const validateNode=async (req:Request,res:Response,next:NextFunction) : Promise<void> =>{
    const {override,name}=req.body;

    if(!override){
        try{
            const node=await Node.findOne({name})

            if(node){
                res.status(400).json({success:false,message:"A node with this name already exists."});
                return
            }
        }catch(err){
            console.log(err)
            res.status(500).json({ success: false, message: "Error validating node" });
            return;
        }
    }
    next();
}