import e from "express";

import { getTree, getTreeById } from "../controllers/treeController";
import {validateCookie, validateUser} from "../middlewares/validateMiddleware"

const router=e.Router();

router.get("/tree",validateUser,getTree)
router.get("/tree/:id",validateCookie,getTreeById)

export default router;