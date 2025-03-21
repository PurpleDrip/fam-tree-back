import dotenv from "dotenv";
dotenv.config();

import express,{ Request, Response, NextFunction }  from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import connectDB from "./config/db";
import authRoute from "./routes/authRoute"
import treeRoute from "./routes/treeRoute"
import nodeRoute from "./routes/nodeRoute"
import startUpdateDaemon from "./services/cronService";

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const FRONTEND_URL=process.env.FRONTEND_URL;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
    origin:FRONTEND_URL , 
    credentials: true, 
  }));

app.get("/", (req, res) => {
    res.send("Official RestAPI for famtree.in");
});

app.use("/api/auth",authRoute);
app.use("/api",treeRoute);
app.use("/api/node",nodeRoute);

app.use((err:Error, req: Request, res:Response, next:NextFunction) => {
    console.error("Global Error Handler:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  });


connectDB().then(() => {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`✅ Server is running on port ${PORT}`);
    });
    startUpdateDaemon();
}).catch(err => {
    console.log("❌ Server startup failed due to DB connection issue:"+ err);
    process.exit(1);
});