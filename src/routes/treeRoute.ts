import e from "express";

import { getTree, getTreeByName } from "../controllers/treeController";
import { validateUser} from "../middlewares/validateMiddleware"

const router=e.Router();

router.get("/tree",validateUser,getTree)
router.get("/treebyname/:treeName",getTreeByName)

export default router;