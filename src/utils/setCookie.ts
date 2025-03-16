import { Request, Response } from "express";
import jwt from "jsonwebtoken";

export const setCookie = async (req:Request, res:Response) :Promise<void>=> {
    try {
        const { treeName,treeId } = res.locals.data;


        const token = jwt.sign({ treeName,treeId}, process.env.JWT_SECRET as string, { expiresIn: "1d" });

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