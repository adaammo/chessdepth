import { Queue, Worker } from "bullmq";
import { redisConnection } from "./redis";
import { QueuePayload } from "./queue";
import { analyzeUser } from "../services/analyze-service/analyzeUser";
import { ChessGame, GameData, GamesDatabase, ProfileDatabase } from "./types";
import { AnalysisReport, NormalizationOfGames } from "../services/analyze-service/normalizeGames";
import { updateChessGames, updateChessProfile } from "../database/chess-profiles";
const QUEUE_NAME = "analysis"
type WorkerReport = {
  jobId: string,
  username: string,
}
const worker = new Worker<QueuePayload, WorkerReport>(QUEUE_NAME, 
    async (job) => {
      try{
        if (!job.id) {
          throw new Error("Job is missing an ID.");
      }
        const { username } = job.data;
        const response = await analyzeUser(username);
        const normalized = await NormalizationOfGames(response, username);
        const profilePayload : ProfileDatabase = {
          username: normalized.username,
          profile_pic: normalized.profile.avatar,
          profile_url: normalized.profile.username,
          total_games: normalized.totalGames,
          rapid_rating: normalized.profile.stats.chess_rapid.last.rating,
          blitz_rating: normalized.profile.stats.chess_blitz.last.rating,
          bullet_rating: normalized.profile.stats.chess_bullet.last.rating,
          opening_stats: normalized.openings,
          synced_at: Date.now(),
          highest_seen_opening: normalized.highestSeen.openingName,
          highest_seen_opening_count: normalized.highestSeen.count,
          win_rate: normalized.overallWinRate,
          best_outcome_opening: normalized.bestOutcome.openingName,
          best_outcome_opening_count: normalized.bestOutcome.count
        };
        await updateChessProfile(profilePayload);
        const gamesPayload : GamesDatabase[] = Object.values(normalized.games).flat().map((games) => {
          return{
            id: games.id,
            opening: games.openingName,
            pgn: games.pgn,
            white_username: games.white_username.toLowerCase(),
            black_username: games.black_username.toLowerCase(),
            result: games.result,
            played_at: games.date,
            opening_variation: games.openingVariation,
            time_class: games.timeClass,
            time_control: games.timeControl,
            white_rating: games.white_rating,
            black_rating: games.black_rating,
            white_ending: games.white_ending,
            black_ending: games.black_ending,
            fen: games.fen
          }
        });
        await updateChessGames(gamesPayload);
        return {
          jobId: job.id,
          username
        };
      } catch (error){
        console.error(`Job: ${job.id}, failed: ${error}`)
        throw error;
      }
    },
    {
    stalledInterval: 15000,
    connection: redisConnection,
    removeOnComplete: {age: 60 * 5},
    concurrency: 1,
    maxStalledCount: 2, 
    }
)
  
  worker.on("failed", (job, error) => {
    console.error("Job failed:", job?.id, error);
  });