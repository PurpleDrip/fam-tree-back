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
    if (!treeId) throw new Error("Family Tree ID is required");

    const treeName = await getTreeName(treeId);

    if (!treeName) throw new Error("No Family Name found");

    return {
      folder: `fam-tree/${treeName}`, 
      allowedFormats: ["jpg", "png", "jpeg", "webp"],
      public_id: file.originalname.split(".")[0], 
    };
  },
});

const upload = multer({ storage });

export default upload; 
