import express from "express"
import cors from "cors"
import { analyze_router } from "../routes/analyze.route";
export const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

app.use("/api/analyze", analyze_router);