import { app } from "./app"
import dotenv from "dotenv"
dotenv.config({path: "dev.env"});

app.post("/api/analyze", (req, res, next) => {
    console.log(`${req.method} ${req.url} ${res.statusCode}`);
    const api_key = req.headers["x-api-key"]
    if (api_key !== process.env.API_KEY) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
    const body = req.body as AnalyzeGame
    if (!body?.username || typeof body.username !== "string") {
        return res.status(400).json({
            error: "You must insert a username."
        })
    }
    return res.status(200).json({
        message: "success"
    })
})
app.listen(8000, () => {
    console.log("listening on 8000")
})