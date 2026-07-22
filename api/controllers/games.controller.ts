import { NextFunction, Request, Response } from "express";
import { getSupabaseClient } from "../lib/supabase";
import { GamesDatabase } from "../lib/types";
const MAX_GAME_SIZE = 25;
export async function getGamesForOpening(req: Request<{ opening: string, side: string, username: string, offset: string }>, res: Response, next: NextFunction) {
    console.log(`${req.method} ${req.url} ${req.statusCode}`);
    const { opening, username, offset, side } = req.params;
    if (side !== "white" && side !== "black") {
        return res.status(400).json({
            error: "Side must be white or black",
        });
    }
    const username_query = side === "white" ? "white_username" : "black_username";
    try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase.from("games")
            .select("*")
            .eq("opening", opening)
            .eq(username_query, username.toLowerCase())
            .order("played_at", { ascending: false })
            .range(Number(offset), Number(offset) + 24)
        if (error) {
            throw error;
        }
        return res.status(200).json({
            games: data as GamesDatabase[],
            nextOffset: Number(offset + 24),
            hasMore: data.length === 25
        });
    }

    catch (error) {
        return next(error);
    }
}