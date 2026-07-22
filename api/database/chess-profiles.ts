'server only'
import { getSupabaseAdminClient } from "../lib/admin";
import { getSupabaseClient } from "../lib/supabase";
import { GamesDatabase, ProfileDatabase } from "../lib/types";
type DatabaseResponse = {
    profile: ProfileDatabase;
}
export async function updateChessProfile(payload: ProfileDatabase) {
    const admin = getSupabaseAdminClient();
    const { error } = await admin.from("profiles")
        .upsert(payload, {
            onConflict: "username"
        })
        .select()
        .single();
    if (error) {
        throw new Error("Something went wrong communicating with the database.");
    }
}
export async function updateChessGames(payload: GamesDatabase[]) {
    const admin = getSupabaseAdminClient();
    const {data, error} = await admin.from("games")
    .upsert(payload, {
        onConflict: "id",
    })
    if (error) {
        throw new Error("Something went wrong communicating with the database.");
    }
}
export async function getChessProfile(username: string) : Promise<{status: "completed", profile: DatabaseResponse} | {status: "failed"}>{
    try{
        const supabase = getSupabaseClient();
        const {data} = await supabase.from("profiles")
        .select("*")
        .eq("username", username)
        .single();
        if(!data){
            throw new Error("Something went wrong with finding this profile");
        }
        return {status: "completed", profile: data as DatabaseResponse}
    }
    catch(err){
        return {status: "failed"};
    }
}