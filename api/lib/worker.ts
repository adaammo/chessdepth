import { Queue, Worker } from "bullmq";
import { redisConnection } from "./redis";
import { QueuePayload } from "./queue";
import { analyzeUser } from "../services/analyze-service/analyzeUser";
import { ChessGame } from "./types";
import { NormalizationOfGames } from "../services/analyze-service/normalizeGames";
const QUEUE_NAME = "analysis"
const worker = new Worker<QueuePayload>(QUEUE_NAME, 
    async (job) => {
        const { username } = job.data;
        const response = await analyzeUser(username);
        return response;
    },
    {
    connection: redisConnection,
    removeOnComplete: {age: 60 * 5},
    concurrency: 1
    }
)

// type chessgame is tempory while stats is being completed
worker.on("completed", async (job, result: ChessGame[]) => {
  await NormalizationOfGames(result, job.data.username);
  });
  
  worker.on("failed", (job, error) => {
    console.error("Job failed:", job?.id, error);
  });