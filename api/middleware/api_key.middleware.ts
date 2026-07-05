import { NextFunction, Request, Response } from "express";

export function requrireApiKey(req: Request, res: Response, next: NextFunction){
    const api_key = req.headers["x-api-key"]
    if (api_key !== process.env.API_KEY) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      next();
}