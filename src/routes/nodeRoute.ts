import e from "express"
import upload from "../config/cloudinary";
import { createNode } from "../controllers/nodeController";
import {  validateUser } from "../middlewares/validateMiddleware";

const router=e.Router();

router.post("/addnode",validateUser,upload.array("images",10),createNode)

export default router;