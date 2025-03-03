import e from "express"

import { registerUser,loginUser } from "../controllers/authController";
import { setCookie } from "../utils/setCookie";

const router=e.Router();

router.post("/register",registerUser,setCookie);
router.post("/login",loginUser,setCookie)
router.post("/logout",clearCookies)

export default router;