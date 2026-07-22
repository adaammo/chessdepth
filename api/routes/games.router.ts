import { Router } from "express";
import { requrireApiKey } from "../middleware/api_key.middleware";
import { getGamesForOpening } from "../controllers/games.controller";

const router = Router();

router.get("/:opening/:side/:username/:offset", requrireApiKey, getGamesForOpening);
export const games_router = router;