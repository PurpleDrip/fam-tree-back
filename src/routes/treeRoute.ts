import e from "express";

import { createTree, getTree, getTreeById } from "../controllers/treeController";
import {validateCookie, validateUser} from "../middlewares/validateMiddleware"
import { UpdateCache } from "../middlewares/cacheMiddleware";

const router=e.Router();

router.post("/addtree",validateUser,createTree,UpdateCache)
router.get("/tree",validateUser,getTree)
router.get("/tree/:id",validateCookie,getTreeById)

export default router;