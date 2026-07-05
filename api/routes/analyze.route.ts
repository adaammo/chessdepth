import { Router } from "express";
import { requrireApiKey } from "../middleware/api_key.middleware";
import { analyzeController } from "../controllers/analyze.controller";
const router = Router();
// Router endpoint is basic /, because main app router holds the true route/prefix
router.post("/", requrireApiKey, analyzeController);

export const analyze_router = router;