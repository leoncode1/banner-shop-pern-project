import { Router } from "express";
import { createOrder, 
        updateOrderStatus, 
        getOrderById, getAllOrdersAdmin,
        getMyOrders, guestOrderLookup } from "../controllers/orderController";
import { authenticate, optionalAuthenticate } from "../middleware/authMiddleware";
import { requireAdmin } from "../middleware/requireAdmin";
import { guestLookupLimiter } from "../middleware/rateLimiter";

const router = Router();

router.post("/", optionalAuthenticate, createOrder);

// Update order status route
router.patch("/:id/status", authenticate, requireAdmin, updateOrderStatus);

// "/" comes before "/:id"
// router.get("/", getOrderByEmail);

router.get("/guest-order", guestLookupLimiter ,guestOrderLookup);
router.get("/my-orders", authenticate, getMyOrders);
router.get("/:id", getOrderById);

router.get("/admin/orders", authenticate, requireAdmin, getAllOrdersAdmin);

export default router;