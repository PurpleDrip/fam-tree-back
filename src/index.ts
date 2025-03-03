import express,{ Request, Response, NextFunction }  from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL=process.env.FRONTEND_URL;

app.use(cors());
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

app.use((err:any, req: Request, res:Response, next:NextFunction) => {
    console.error("Global Error Handler:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  });

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
