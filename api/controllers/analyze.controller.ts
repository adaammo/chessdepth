import { NextFunction, Request, Response } from "express";
import { AnalyzeGame } from "../lib/types";
import { chess_queue } from "../lib/queue";
import crypto from "crypto"
export async function analyzeController(req: Request, res: Response, next: NextFunction) {
    console.log(`${req.method} ${req.url} ${res.statusCode}`)
    try {
        const body = req.body as AnalyzeGame
        if (!body?.username || typeof body.username !== "string") {
            return res.status(400).json({
                error: "You must insert a username."
            })
        }
        const username = body.username
        const uuid = crypto.randomUUID();
        const jobId = `analysis:${username}:${uuid}`
        const existingJob = await chess_queue.getJob(jobId);
        if (existingJob) {
            const state = await existingJob.getState();
            if (state === "completed") {
                return res.status(200).json({
                    status: "completed",
                    username,
                    uuid,
                    result: existingJob.returnvalue,
                });
            }

            if (state === "waiting" || state === "active" || state === "delayed") {
                return res.status(202).json({
                    status: "processing",
                    username,
                    uuid,
                });
            }

            if (state === "failed") {
                return res.status(409).json({
                    status: "failed",
                    username,
                    uuid,
                    failedReason: existingJob.failedReason,
                });
            }
        }
        await chess_queue.add("analyze-user", { username }, {
            jobId: jobId,
            attempts: 3,
            removeOnComplete: { age: 60 * 5 },
            removeOnFail: true
        });
        return res.status(200).json({
            status: "added",
            message: "Username Found! Waiting to analyze",
            username: username,
            uuid: uuid
        })
    }
    catch (error) {
    if (error instanceof Error && error.message === "USERNAME_NOT_FOUND") {
        return res.status(404).json({
            error: "Username not found.",
        });
    }

    if (
        error instanceof Error &&
        error.message.startsWith("CHESS_API_ERROR")
    ) {
        return res.status(503).json({
            error: "Chess.com API is unavailable right now.",
        });
    }

    next(error);
}
}