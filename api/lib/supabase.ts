import {createClient} from "@supabase/supabase-js"
import dotenv from "dotenv"
dotenv.config({path: "api/dev.env"});

export function getSupabaseClient(){
    const supabase = createClient(
        process.env.SUPABASE_URL ?? "",
        process.env.SUPABASE_PUBLISHABLE_KEY ?? ""
    )
    return supabase;
}