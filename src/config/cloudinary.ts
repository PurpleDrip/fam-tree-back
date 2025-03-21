import cloudinary from "cloudinary";
import { Request} from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v4 as uuidv4 } from 'uuid';


cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary.v2,
  params: async (req: Request) => {
    const {treeName} = req.body || "default_tree";
    return {
      folder: `fam-tree/${treeName}`, 
      allowedFormats: ["jpg", "png", "jpeg", "webp"],
      public_id: uuidv4(), 
    };
  },
});

const upload = multer({ storage });

export default upload;
