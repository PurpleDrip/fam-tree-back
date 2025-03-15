import e from "express"
import { addImages, changeDP, createNode, deleteNode, getImagesForID, updatePosition } from "../controllers/nodeController";
import { validateNode, validateUser } from "../middlewares/validateMiddleware";
import { UpdateCache } from "../middlewares/cacheMiddleware";
import { uploadMiddleware } from "../middlewares/uploadMiddleware";

const router=e.Router();

router.post("/addnode",validateUser,validateNode,uploadMiddleware,createNode,UpdateCache)
router.post("/updateposition",validateUser,updatePosition,UpdateCache)

router.put("/addimagestoid",validateUser,uploadMiddleware,addImages,UpdateCache)
router.get("/getimagesbyid/:id",getImagesForID)
router.post("/changedp",validateUser,changeDP,UpdateCache)

router.post("/deletenode",validateUser,deleteNode,UpdateCache)

export default router;