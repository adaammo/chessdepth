import { NextFunction, Request, Response } from "express";
import { AnalyzeGame } from "../lib/types";
import { ArchivesDestructor, getPlayerArchives } from "../services/archives";



export async function analyzeController(req: Request, res: Response, next: NextFunction) {
    console.log(`${req.method} ${req.url} ${res.statusCode}`);
    try {
        const body = req.body as AnalyzeGame
        if (!body?.username || typeof body.username !== "string") {
            return res.status(400).json({
                error: "You must insert a username."
            })
        }
        const username = body.username
        const archives = await getPlayerArchives(username);
        const games = await ArchivesDestructor(archives, username);
        return res.status(200).json({
            message: "Username Found!"
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