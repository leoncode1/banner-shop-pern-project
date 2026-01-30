import { Router } from "express";
import { getBannerOptions } from "../controllers/bannerOptionController";

const router = Router();

router.get("/", getBannerOptions);

export default router;