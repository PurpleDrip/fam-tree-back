import { NextFunction, Request, Response } from "express";
import upload from "../config/cloudinary";
import multer from "multer";

export const uploadMiddleware = (req: Request, res: Response, next: NextFunction):void => {
    const uploadImages = upload.array("images", 10); 

    uploadImages(req, res, (err: any) => {
        if (err instanceof multer.MulterError) {
            if (err.code === "LIMIT_UNEXPECTED_FILE") {
                res.status(400).json({ message: "You can upload a maximum of 10 images.",success:false });
                return 
            }
        } else if (err) {
            res.status(500).json({ message: "File upload error.",success:false });
            return 
        }
        next();
    });
};