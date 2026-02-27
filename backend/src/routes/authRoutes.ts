import {Router} from "express";
import { register, login, logout, me, refresh } from "../controllers/authController";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

// Added for session persistence
router.get("/me", authenticate, me);

router.post("/register", register);
router.post("/login", login);

router.post("/logout", logout);

router.post("/refresh", refresh);

export default router;
