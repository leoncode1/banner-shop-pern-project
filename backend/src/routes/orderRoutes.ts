import { Router } from "express";
import { createOrder, updateOrderStatus, getOrderById, getMyOrders } from "../controllers/createOrderController";
import { authenticate, optionalAuthenticate } from "../middleware/authMiddleware";
import { requireAdmin } from "../middleware/requireAdmin";

const router = Router();

router.post("/", optionalAuthenticate, createOrder);

// Update order status route
router.patch("/:id/status", authenticate, requireAdmin, updateOrderStatus);

// "/" comes before "/:id"
// router.get("/", getOrderByEmail);
router.get("/my-orders", authenticate, getMyOrders);
router.get("/:id", getOrderById);

export default router;