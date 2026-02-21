import { Router } from "express";
import { getAllOrdersAdmin } from "../controllers/orderController";
import { authenticate } from "../middleware/authMiddleware";
import { requireAdmin } from "../middleware/requireAdmin";
const router = Router();

router.get("/orders", authenticate, requireAdmin, getAllOrdersAdmin);

export default router;