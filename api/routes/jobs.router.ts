import { Router } from "express";
import { getJobId, profileDatabaseRead } from "../controllers/jobs.controller";
import { requrireApiKey } from "../middleware/api_key.middleware";

const router = Router();

router.get("/:jobId", requrireApiKey,getJobId);
router.get("/profile/:username", requrireApiKey, profileDatabaseRead);

export const job_router = router;