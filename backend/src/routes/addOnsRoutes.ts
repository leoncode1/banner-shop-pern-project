import { Router } from "express";
import { getAddOns } from "../controllers/addOnController";

const router = Router();

router.get("/", getAddOns);

export default router;