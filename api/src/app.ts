import express, { NextFunction, Request, Response } from "express"
import cors from "cors"
import { analyze_router } from "../routes/analyze.route";
import { job_router } from "../routes/jobs.router";
import { games_router } from "../routes/games.router";
export const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

app.use("/api/analyze", analyze_router);
app.use("/api/jobs", job_router);
app.use("/api/games", games_router);

app.use((
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(error);

  return res.status(500).json({
      error: "Something went wrong internally.",
  });
});