import { Queue } from "bullmq";
import { redisConnection } from "./redis";
import { AnalysisReport } from "../services/analyze-service/normalizeGames";
export type QueuePayload = {
    username: string
}

export const chess_queue = new Queue<QueuePayload, AnalysisReport>("analysis", {
    connection: redisConnection
})