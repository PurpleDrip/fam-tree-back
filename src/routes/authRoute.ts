import e from "express"

import { registerUser,loginUser, clearCookies } from "../controllers/authController";
import { setCookie } from "../utils/setCookie";
import { CheckForCookies } from "../middlewares/authMiddleware";
import { validateUser } from "../middlewares/validateMiddleware";

const router=e.Router();

router.post("/register",registerUser,setCookie);
router.post("/login",loginUser,setCookie)
router.post("/logout",clearCookies)
router.get("/session",validateUser,CheckForCookies)

export default router;