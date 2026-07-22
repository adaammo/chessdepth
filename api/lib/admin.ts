import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv"
dotenv.config({path: "dev.env"});

export function getSupabaseAdminClient(){
      const supabase = createClient(
        process.env.SUPABASE_URL ?? "",
        process.env.SUPABASE_SERVICE_KEY ?? ""
    )
    return supabase;
}