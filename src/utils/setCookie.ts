import { Request, Response } from "express";
import jwt from "jsonwebtoken";

import redis from "../config/redis";

const TOKEN_NAME = process.env.TOKEN_NAME;

export const setCookie = async (req:Request, res:Response) :Promise<void>=> {
    try {
        const { id,treeId } = res.locals.data;

        const treeData={
            treeName:res.locals.data.treeName,
            nodes:res.locals.data.nodes,
            edges:res.locals.data.edges
        }

        await redis.setex(`session:tree:${treeId}`, 7 * 24 * 60 * 60, JSON.stringify(treeData));

        const token = jwt.sign({ userId: id,treeId }, process.env.JWT_SECRET as string, { expiresIn: "7d" });

        res.cookie(TOKEN_NAME as string, token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        if(res.locals.newUser){
            await res.locals.newUser.save(); 
        }
        res.status(201).json({ message: "Cookie set successfully", success: true, data: res.locals.data });
        return ;
    } catch (error: unknown) {
        const err = error as { message: string };
        res.status(500).json({ message: "Error setting cookie", error: err.message });
        return ;
    }
};
