import { Queue } from "bullmq";
import { redisConnection } from "./redis";
import { AnalysisReport } from "../services/analyze-service/normalizeGames";
export type QueuePayload = {
    username: string
}

export const chess_queue = new Queue<QueuePayload, AnalysisReport>("analysis", {
    connection: redisConnection

})
// do not change, chess.com api allows infinite serial requests, but parallel requests will be flagged
chess_queue.setGlobalConcurrency(1);