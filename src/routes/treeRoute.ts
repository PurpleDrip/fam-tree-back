import e from "express";

import { addEdge, createTree, getTree, getTreeById, getTreeByName, updateEdge, updateTree } from "../controllers/treeController";
import {validateCookie, validateUser} from "../middlewares/validateMiddleware"
import { UpdateCache, UpdateCacheAndCookie } from "../middlewares/cacheMiddleware";

const router=e.Router();

router.post("/addtree",validateUser,createTree,UpdateCacheAndCookie)
router.get("/tree",validateUser,getTree)
router.get("/tree/:id",validateCookie,getTreeById)
router.get("/treebyname/:treeName",getTreeByName)

router.post("/addedge",validateUser,addEdge,UpdateCache)
router.post("/updateedge",validateUser,updateEdge,UpdateCache)

router.put("/updatetree",validateUser,updateTree,UpdateCache);

export default router;