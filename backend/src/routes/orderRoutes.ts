import { Router } from "express";
import { createOrder, updateOrderStatus, getOrderByEmail, getOrderById } from "../controllers/createOrderController";

const router = Router();

router.post("/", createOrder);

// Update order status route
router.patch("/:id/status", updateOrderStatus);

// "/" comes before "/:id"
router.get("/", getOrderByEmail);
router.get("/:id", getOrderById);

export default router;