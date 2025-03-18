import e, { Request, Response } from "express"

import { loginTree, registerTree,clearCookies, setCookie } from "../controllers/authController";
import { validateUser } from "../middlewares/validateMiddleware";

const router=e.Router();

router.post("/register",registerTree,setCookie);
router.post("/login",loginTree,setCookie)
router.post("/logout",clearCookies)
router.get("/session",validateUser,(req:Request,res:Response)=>{
    res.status(200).json({message:"jwt verified",data:res.locals.data})
})

export default router;