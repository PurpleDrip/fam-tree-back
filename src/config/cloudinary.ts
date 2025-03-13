import cloudinary from "cloudinary";
import { Request, Response } from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { getTreeName } from "../services/treeService";


cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary.v2,
  params: async (req: Request, res: Response, file: Express.Multer.File) => {
    const { treeId } = res.locals.cookieData; 
    if (!treeId) return res.status(400).json({message:"No tree ID found",success:false})

    const treeName = await getTreeName(treeId);

    if (!treeName) return res.status(400).json({message:"No tree name found for this ID",success:false});

    if(Array.isArray(req.files) && req.files.length > 10){
      return res.status(400).json({message:"Can upload a maximum of 10 images per request.",success:false});
    }

    return {
      folder: `fam-tree/${treeName}`, 
      allowedFormats: ["jpg", "png", "jpeg", "webp"],
      public_id: file.originalname.split(".")[0], 
    };
  },
});

const upload = multer({ storage });

export default upload; 
