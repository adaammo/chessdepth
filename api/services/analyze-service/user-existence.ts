import { getSupabaseClient } from "../../lib/supabase"
export async function DoesThisUserExist(username: string): Promise<{ exists: true, startFrom: Date } | { exists: false }> {
    try {
        const supabase = getSupabaseClient();
        const { data: profile, error } = await supabase
            .from("profiles")
            .select("username")
            .eq("username", username)
            .single()
        if (!profile) {
            return { exists: false }
        }
        // now get recent game
        const { data: games, error: gamesError } = await supabase.from("games")
            .select("played_at")
            .or(`black_username.eq.${username},white_username.eq.${username}`)
            .order("played_at", { ascending: false })
            .limit(1)
            .single()
        if (gamesError) {
            throw "DATABASE_FAILURE";
        }
        // start from this month rather then the furthest. 
        const lastGame = new Date(games.played_at * 1000);
        const now = new Date();
        if (lastGame == now){
            return {exists: true, startFrom: lastGame}
        }
        const lastGameMonth = new Date(
            lastGame.getFullYear(),
            lastGame.getMonth(),
            1
        );

        const sixMonthFloor = new Date(
            now.getFullYear(),
            now.getMonth() - 5,
            1
        );
        const startFrom =
            (lastGameMonth > sixMonthFloor
                ? lastGameMonth
                : sixMonthFloor);
        return {exists: true, startFrom}
    }
    catch (error) {
        throw new Error("DATABASE_FAILURE")
    }
}