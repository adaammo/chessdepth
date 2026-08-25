import { motion, color, easeIn, easeInOut } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { AnalysisReport, OpeningData } from "@/src/lib/services/types";
import { GamesAPIResponse, ProfileDatabase } from "@/api/lib/types";
import { startTransition, TransitionStartFunction } from "react";
import { getOpeningGames } from "@/src/lib/services/api-functions";
import { GamesPopUp } from "../MainHistoryPage";

type CardPreview = {
    data: OpeningData,
    gamesCache: Map<string, GamesAPIResponse> | null,
    games: GamesAPIResponse | null;
    openingGameCount: number
    scorePercent: number,
    side: "white" | "black";
    setGamesPopUp: (p: GamesPopUp) => void,
    profile: ProfileDatabase,
    isPopup: boolean,
    rowGridConst: string;
    index: number;
    isPending: boolean;
    startTransition: TransitionStartFunction
    username: string
    setGamesCache: React.Dispatch<
        React.SetStateAction<Map<string, GamesAPIResponse> | null>
    >
    setGames: (p: GamesAPIResponse | null) => void
    setStatus: (p: "completed" | "processing" | "queued" | "not_found" | "failed" | null) => void
}
export default function CardPreview({ data, openingGameCount, games, scorePercent, side, setGamesPopUp, profile, isPopup, rowGridConst, index, isPending, startTransition, username, setGames, setStatus, gamesCache, setGamesCache }: CardPreview) {
    const rowGrid = "md:grid grid-cols-[38px_minmax(0,0.8fr)_minmax(140,0.8fr)_135px_25px] gap-x-4 items-center p-4"
    return (
        <motion.div
            onClick={async () => {
                setGames(null);
                setGamesPopUp({
                    opening_name: data.openingName,
                    wins: side === "white" ? data.white.whiteWins : data.black.blackWins,
                    losses: side === "white" ? data.white.whiteLosses : data.black.blackLosses,
                    draws: side === "white" ? data.white.whiteDraws : data.black.blackDraws,
                });
                const opening = data.openingName;
                const key = `${username}:${opening}:${side}`;
                const cached = gamesCache?.get(key);
                if (cached) {
                    setGames(cached);
                    return;
                }
                startTransition(async () => {
                    const response = await getOpeningGames("0", opening, side, username);
                    if (response.status === "failed" || response.status === "not_found") {
                        return setStatus(response.status);
                    }
                    if (response.status === "completed") {
                        setGamesCache(previous => {
                            const updated = new Map(previous ?? []);
                            updated.set(key, response.profile);
                            return updated;
                        });
                        setGames(response.profile);
                    }
                });
            }}
            className={`flex flex-col items-start md:items-center ${rowGrid} ${isPending && "cursor-not-allowed"} hover:opacity-75 font-medium cursor-pointer duration-200 border-b border-(--accent-muted)
${profile?.best_outcome_opening === data.openingName
                    ? `
                bg-linear-to-r
                from-(--accent-muted)
                from-0%
                to-(--bg-secondary)
                to-55%
              border-l
               border-(--accent)
              `
                    : "bg-(--bg-primary)"
                }`}>
            <span className="hidden md:block text-(--text-muted)">
                {index}
            </span>
            <div className="flex md:flex-col items-center md:items-start w-full justify-between gap-2">
                <div className="flex flex-col gap-0.5 items-start justify-center">
                    <p className="text-lg font-medium text-wrap">
                        {data.openingName}
                    </p>
                    <span className="text-sm mb-1 text-(--text-muted)">
                        View {openingGameCount} games played
                    </span>
                </div>
                <p className="md:hidden flex flex-col gap-0.5 items-start justify-center">
                    {scorePercent.toFixed(2)}%
                    <span className={`text-(--text-muted) text-sm`}>
                        score across games
                    </span>
                </p>
            </div>
            <div className="flex flex-col gap-1 items-start justify-center w-full">
                <div className="w-full h-2 bg-(--accent-muted) border-(--border-subtle) rounded-full">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${scorePercent}%` }}
                        transition={{ duration: 0.4, ease: easeInOut }}
                        style={{
                            backgroundColor: "var(--accent)",
                        }}
                        className="h-full rounded-full"
                    />
                </div>
                <div className="flex flex-row gap-2 text-(--text-secondary) text-sm ">
                    <span className="text-(--success)">
                        {side === "white" ? data.white.whiteWins : data.black.blackWins}W
                    </span>
                    <span>
                        {side === "white" ? data.white.whiteDraws : data.black.blackDraws}D
                    </span>
                    <span className="text-(--danger)">
                        {side === "white" ? data.white.whiteLosses : data.black.blackLosses}L
                    </span>
                </div>
            </div>
            <p className="hidden md:flex flex-col gap-0.5 items-start">
                {scorePercent}%
                <span className={`text-(--text-muted) text-sm`}>
                    score across games
                </span>
            </p>
            <ChevronRight size={12} className="hidden md:block" />
        </motion.div>
    )
}