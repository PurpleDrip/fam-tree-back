import { Request, Response } from "express";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";

export const validateUser=(req:Request,res:Response):void=>{
    const TOKEN_NAME = process.env.TOKEN_NAME as string;
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

        if (![id, treeId].every(mongoose.Types.ObjectId.isValid)) {
            res.status(400).json({ message: "Invalid Object Id" });
            return;
        }        

        res.locals.cookieData.id=id;
        res.locals.cookieData.treeId=treeId;

        return;
    } catch (err) {
        res.status(401).json({ message: "Invalid token", error: (err as Error).message });
        return;
    }

}