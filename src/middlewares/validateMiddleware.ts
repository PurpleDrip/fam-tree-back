import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";

import Node from "../models/nodeModel";
import multer from "multer";

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

        res.locals.data={
            treeName,
            treeId,
            type
        };

        next();
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
    const parseForm = multer().none();
    parseForm(req, res, async (err) => {
        if (err) {
            console.log(err)
            return res.status(400).json({ success: false, message: "Error parsing form data" });
        }

        const { override, name } = req.body;

        if (!name) {
            return res.status(400).json({ success: false, message: "Node name is required." });
        }

        if (!override) {
            try {
                const existingNode = await Node.findOne({ "data.name": name }); 
                if (existingNode) {
                    return res.status(400).json({ success: false, message: "A node with this name already exists." });
                }
            } catch (err) {
                console.error("Error validating node:", err);
                return res.status(500).json({ success: false, message: "Error validating node" });
            }
        }

        next();
    });
}