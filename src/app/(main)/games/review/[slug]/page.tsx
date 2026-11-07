import { getSupabaseClient } from "@/api/lib/supabase";
import { GamesDatabase } from "@/api/lib/types";
import HistoryErrorPage from "@/src/components/History/HistoryErrorPage";
import Review from "@/src/components/Review/Review";

export default async function GameAnalysisPage({ params, searchParams }: { params: Promise<{ slug: string }>, searchParams: Promise<{ perspective: string, pfp_url: string, move: string }> }) {
    const supabase = getSupabaseClient();
    const gameId = (await params).slug;
    const username = (await searchParams).perspective;
    const pfp_url = (await searchParams).pfp_url
    const move = Number((await searchParams).move);
    console.log(pfp_url)

    const { data, error } = await supabase.from("games")
        .select("*")
        .eq("id", gameId)
        .single()
    if (error) {
        return <HistoryErrorPage errorMsg={"This game does not exist from what we can tell. If this is incorrect, please mark this."} />
    }

    const game = data as GamesDatabase;
    console.log(gameId, username);
    return (
        <Review game={game} perspective={username} pfp_url= {pfp_url } move = {move} />
    )
}