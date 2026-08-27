'server only'
import { getSupabaseAdminClient } from "../lib/admin";
import { getSupabaseClient } from "../lib/supabase";
import { GamesDatabase, OpeningData, ProfileDatabase } from "../lib/types";
type DatabaseResponse = {
    profile: ProfileDatabase;
}
export async function updateChessProfile(payload: ProfileDatabase) {
    const admin = getSupabaseAdminClient();
    // 1. Get existing stats
    const username = payload.username;
    const { data: profile, error: fetchError } = await admin
        .from("profiles")
        .select("opening_stats, total_games")
        .eq("username", username)
        .single();
    //
    if (!profile) {
        const {error: insertError} = await admin
        .from("profiles")
        .insert(payload)
        .single()
        if (insertError){
            throw "DATABASE_FAILURE"
        }
        return;
    }
    if (fetchError){
        console.log("ejuhwygrhwukjrfhhjwerfb: fetch")
        throw fetchError
    }
    const oldStats: OpeningData[] =
        profile.opening_stats ?? [];
    const statsMap = new Map<string, OpeningData>();

    for (const opening of oldStats) {
        statsMap.set(opening.openingName, opening);
    }

    for (const incoming of payload.opening_stats) {
        const existing = statsMap.get(incoming.openingName);

        if (!existing) {
            statsMap.set(incoming.openingName, incoming);
            continue;
        }
        // mix old + new since openings is NOT A SEPERATE DATA TABLE
        existing.white.whiteGames += incoming.white.whiteGames;
        existing.white.whiteWins += incoming.white.whiteWins;
        existing.white.whiteLosses += incoming.white.whiteLosses;
        existing.white.whiteDraws += incoming.white.whiteDraws;

        existing.white.whiteScore =Number((
            existing.white.whiteWins +
            existing.white.whiteDraws * 0.5).toFixed(2));

        existing.white.whitePercentage =
            existing.white.whiteGames === 0
                ? 0
                : Number(((existing.white.whiteScore /
                    existing.white.whiteGames) * 100).toFixed(2));

        existing.black.blackGames += incoming.black.blackGames;
        existing.black.blackWins += incoming.black.blackWins;
        existing.black.blackLosses += incoming.black.blackLosses;
        existing.black.blackDraws += incoming.black.blackDraws;

        existing.black.blackScore =
            Number((existing.black.blackWins +
            existing.black.blackDraws * 0.5).toFixed(2));

        existing.black.blackPercentage =
            existing.black.blackGames === 0
                ? 0
                : Number(((existing.black.blackScore /
                    existing.black.blackGames) * 100).toFixed(2));
    }

    const mergedStats = Array.from(statsMap.values());

    const { error: updateError } = await admin
        .from("profiles")
        .update({
            profile_url: payload.profile_url,

            rapid_rating: payload.rapid_rating,
            blitz_rating: payload.blitz_rating,
            bullet_rating: payload.bullet_rating,

            total_games: profile.total_games + payload.total_games,

            opening_stats: mergedStats,

            synced_at: payload.synced_at,
        })
        .eq("username", username);

    if (updateError) {
        console.log("ejuhwygrhwukjrfhhjwerfb: fetch")
        throw updateError;
    }
    if (fetchError) {
        throw new Error("Something went wrong communicating with the database.");
    }
}
export async function updateChessGames(payload: GamesDatabase[]) {
    const admin = getSupabaseAdminClient();
    const { data, error } = await admin.from("games")
        .upsert(payload, {
            onConflict: "id",
        })
    if (error) {
        throw new Error("Something went wrong communicating with the database.");
    }
}
export async function getChessProfile(username: string): Promise<{ status: "completed", profile: DatabaseResponse } | { status: "failed" }> {
    try {
        const supabase = getSupabaseClient();
        const { data } = await supabase.from("profiles")
            .select("*")
            .eq("username", username)
            .single();
        if (!data) {
            throw new Error("Something went wrong with finding this profile");
        }
        return { status: "completed", profile: data as DatabaseResponse }
    }
    catch (err) {
        return { status: "failed" };
    }
}