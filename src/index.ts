import dotenv from "dotenv";
dotenv.config();

import express,{ Request, Response, NextFunction }  from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { alert, info, success } from "./utils/logger";
import connectDB from "./config/db";
import authRoute from "./routes/authRoute"

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL=process.env.FRONTEND_URL;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
    origin: FRONTEND_URL, 
    credentials: true, 
  }));

app.get("/", (req, res) => {
    res.send("Official RestAPI for famtree.in");
});

app.use("/auth",authRoute);

app.use((err:any, req: Request, res:Response, next:NextFunction) => {
    console.error("Global Error Handler:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  });


connectDB().then(() => {
    app.listen(PORT, () => {
        success(`✅ Server is running on port ${PORT}`);
        info(`RestAPI running at "http://localhost:${PORT}"\n`)
    });
}).catch(err => {
    alert("❌ Server startup failed due to DB connection issue:"+ err);
    process.exit(1);
});
