import e from "express"
import { addImages, changeDP, createNode, deleteImgById, deleteNode, getImagesForID } from "../controllers/nodeController";
import { validateNode, validateUser } from "../middlewares/validateMiddleware";
import { uploadMiddleware } from "../middlewares/uploadMiddleware";
import { updateCache } from "../middlewares/cacheMiddleware";

const router=e.Router();

router.post("/addnode",validateUser,uploadMiddleware,createNode,updateCache)
router.post("/deletenode",validateUser,deleteNode,updateCache)

router.put("/addimagestoid",validateUser,uploadMiddleware,addImages,updateCache)
router.post("/deleteimgbyid",validateUser,deleteImgById,updateCache)

router.get("/getimagesbyid/:id",getImagesForID)
router.post("/changedp",validateUser,changeDP,updateCache);

export default router;