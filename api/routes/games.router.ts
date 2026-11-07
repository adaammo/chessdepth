import { Router } from "express";
import { requrireApiKey } from "../middleware/api_key.middleware";
import { getAllGames, getGamesForOpening } from "../controllers/games.controller";

const router = Router();

router.get("/:opening/:side/:username/:offset", requrireApiKey, getGamesForOpening);
router.get("/all/:username/:offset", requrireApiKey, getAllGames);
export const games_router = router;