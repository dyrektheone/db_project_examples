import { register, verify } from "../controllers/auth";
import { Router } from "express";

const router = Router();

router.post("/register",register);
router.post("/verify",verify);

export default router;