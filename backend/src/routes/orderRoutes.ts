import { Router } from "express";
import { createOrder } from "../controllers/createOrderController";

const router = Router();

router.post("/", createOrder);

export default router;