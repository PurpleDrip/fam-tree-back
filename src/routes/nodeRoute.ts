import e from "express"
import upload from "../config/cloudinary";
import { createNode, deleteNode, getImagesForID, updatePosition } from "../controllers/nodeController";
import {  validateFiles, validateNode, validateUser } from "../middlewares/validateMiddleware";
import { UpdateCache } from "../middlewares/cacheMiddleware";

const router=e.Router();

router.post("/addnode",validateUser,validateFiles,validateNode,upload.array("images",10),createNode,UpdateCache)
router.post("/updateposition",validateUser,updatePosition,UpdateCache)

router.get("/getimagesbyid/:id",getImagesForID)

router.post("/deletenode",validateUser,deleteNode,UpdateCache)

export default router;