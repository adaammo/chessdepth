import { Response, Request, NextFunction } from "express"
import { chess_queue } from "../lib/queue"

export async function getJobId(req: Request<{jobId: string}>, res: Response, next: NextFunction){
    console.log(`${req.method} ${req.url} ${res.statusCode}`);
    try {
        const jobId = req.params.jobId
        const job = await chess_queue.getJob(jobId);
        if (!job) {
            return res.status(404).json({ error: "No history found for this username." })
        }
        const state = await job.getState()
        if (state === 'waiting' || state === 'delayed') {
            return res.status(200).json({ status: 'queued' })
        }
    
        if (state === 'active') {
            return res.status(200).json({ status: 'processing' })
        }
    
        if (state === 'completed') {
            return res.status(200).json({ status: 'completed', result: job.returnvalue })
        }
    
        if (state === 'failed') {
            return res.status(200).json({ status: 'failed' })
        }
    
    } catch (err) {
        return res.status(500).json({ error: "Internal server error." })
    }
}
// usually limit will  be like 10-15 for this
export async function getGamesFromJob(req: Request<{offset: number, limit: number}>, res: Response, next: NextFunction){
    console.log(`${req.method} ${req.url} ${res.statusCode}`);
    try{
        
    }
    catch{
        
    }
}