import { Response, Request, NextFunction } from "express"
import { chess_queue } from "../lib/queue"
import { GameData } from "../lib/types";
import { getChessProfile } from "../database/chess-profiles";

export async function getJobId(req: Request<{jobId: string}>, res: Response, next: NextFunction){
    console.log(`${req.method} ${req.url} ${res.statusCode}`);
    try {
        const jobId = req.params.jobId
        const job = await chess_queue.getJob(jobId);
        if (!job) {
            return res.status(404).json({ status: "failed", reason: "No history found for this username. Either this user doesn't exist, OR has not played a game within the last six months." })
        }
        const state = await job.getState()
        if (state === 'waiting' || state === 'delayed') {
            return res.status(200).json({ status: 'queued' })
        }
    
        if (state === 'active') {
            return res.status(200).json({ status: 'processing' })
        }
    
        if (state === 'completed') {
            console.log(job.returnvalue)
            return res.status(200).json({ status: 'completed', result: job.returnvalue })
        }
    
        if (state === 'failed') {
            const reason = job.failedReason == "DATABSE_ERROR" ? "Something happened Internally. Please restart from the beginning." : 
            job.failedReason === "NO_RECENT_GAMES" ? "This service relies on games that were played in the last 6 months. Please play some games and try using the service again later.": ""
            return res.status(200).json({ status: 'failed', reason: "" })
        }
    
    } catch (err) {
        return res.status(500).json({ error: "Internal server error." })
    }
}
// usually limit will  be like 10-15 for this
export async function getGamesFromJob(req: Request<{opening: string | null, offset: number, limit: number, jobId: string}>, res: Response, next: NextFunction){
    console.log(`${req.method} ${req.url} ${res.statusCode}`);
    try{
        const job = await chess_queue.getJob(req.params.jobId);
        const games = Object.values(job?.returnvalue.games ?? []);

        if(!games){
            res.status(500).json({
                error: "User information was not able to be found."
            })
        }
        if(req.params.opening){
            games.filter((f) => f.openingName === req.params.opening);
        }
        const payload: GameData[] = [];
        for(let i = req.params.offset; i < games.length && i < req.params.limit; i++){
            payload.push(games[i]);
        }
        return payload;
    }
    catch(error){
        throw error;
    }
}
export async function profileDatabaseRead(req: Request<{username: string}>, res: Response, next: NextFunction){
    console.log(`${req.method} ${req.url} ${res.statusCode}`);
    try{
        const data = await getChessProfile(req.params.username);
        if(data.status === "failed"){
            return res.status(401).json({
                error: "No chess profile found within the database"
            })
        }
        return res.status(200).json({status: "completed", profile: data.profile});
    }
    catch(error){
        throw error;
    }
}