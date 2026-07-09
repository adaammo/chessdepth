import { Queue, Worker } from "bullmq";
import { redisConnection } from "./redis";
import { QueuePayload } from "./queue";
import { analyzeUser } from "../services/analyze-service/analyzeUser";
import { ChessGame, GameData } from "./types";
import { AnalysisReport, NormalizationOfGames } from "../services/analyze-service/normalizeGames";
const QUEUE_NAME = "analysis"
const worker = new Worker<QueuePayload, AnalysisReport>(QUEUE_NAME, 
    async (job) => {
        const { username } = job.data;
        const response = await analyzeUser(username);
        const frontendData = await NormalizationOfGames(response, username);
        return frontendData;
    },
    {
    stalledInterval: 15000,
    connection: redisConnection,
    removeOnComplete: {age: 60 * 5},
    concurrency: 1,
    maxStalledCount: 2, 
    }
)
  
  worker.on("failed", (job, error) => {
    console.error("Job failed:", job?.id, error);
  });