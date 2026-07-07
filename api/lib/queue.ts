import { Queue } from "bullmq";
import { redisConnection } from "./redis";
export type QueuePayload = {
    username: string
}

export const chess_queue = new Queue<QueuePayload>("analysis", {
    connection: redisConnection
})