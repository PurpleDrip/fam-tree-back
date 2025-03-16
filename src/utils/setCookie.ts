import { Request, Response } from "express";
import jwt from "jsonwebtoken";

const TOKEN_NAME = process.env.TOKEN_NAME;

export const setCookie = async (req:Request, res:Response) :Promise<void>=> {
    try {
        const { userId,treeId } = res.locals.data;


        const token = jwt.sign({ userId,treeId }, process.env.JWT_SECRET as string, { expiresIn: "1d" });

        res.cookie(TOKEN_NAME as string, token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000 ,
        });

        res.status(201).json({ message: "Cookie set successfully", success: true, data: res.locals.data });
        return ;
    } catch (error: unknown) {
        const err = error as { message: string };
        res.status(500).json({ message: "Error setting cookie", error: err.message });
        return ;
    }
};
