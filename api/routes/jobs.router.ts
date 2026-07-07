import { Router } from "express";
import { getJobId } from "../controllers/jobs.controller";

const router = Router();

router.get("/:jobId", getJobId)

export const job_router = router;