import dotenv from "dotenv";
dotenv.config();

import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { inject } from "@vercel/analytics";
import { VercelRequest, VercelResponse } from "@vercel/node";

import { alert, info, success } from "../utils/logger";
import connectDB from "../config/db";
import authRoute from "../routes/authRoute";
import treeRoute from "../routes/treeRoute";
import nodeRoute from "../routes/nodeRoute";

const app = express();
const FRONTEND_URL = process.env.FRONTEND_URL;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
    origin: FRONTEND_URL, 
    credentials: true, 
}));

app.use((req, res, next) => {
    inject();
    next();
});

app.get("/", (req, res) => {
    res.send("Official RestAPI for famtree.in");
});

export default async (req: VercelRequest, res: VercelResponse) => {
    await connectDB();  
    info("Successfully connected to MongoDB")
    return app(req, res);
};

app.use("/api/auth", authRoute);
app.use("/api", treeRoute);
app.use("/api/node", nodeRoute);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error("Global Error Handler:", err);
    alert(err)
    res.status(500).json({ success: false, message: "Internal Server Error" });
});
