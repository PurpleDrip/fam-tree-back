import e from "express"

import { registerUser } from "../controllers/authController";
import { setCookie } from "../utils/setCookie";

const router=e.Router();

router.post("/register",registerUser,setCookie);

export default router;