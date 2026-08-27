"use server"
import { GamesDatabase } from "@/api/lib/types";
import HomePage from "../components/Home/HomePage";
import { getSupabaseClient } from "@/api/lib/supabase";

export default async function Home() {
  return (
    <HomePage/>
  );
}
