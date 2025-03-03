import e from "express";
import { getTree } from "../controllers/treeController";
import {validateUser} from "../middlewares/validateMiddleware"

const router=e.Router();

router.get("/tree",validateUser,getTree)

export default router;