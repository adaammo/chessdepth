import { motion, color, easeIn, easeInOut } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { GamesPopup } from "../MainHistoryPage";
import { AnalysisReport, OpeningData } from "@/src/lib/services/types";

type CardPreview = {
    data: OpeningData,
    games: number,
    scorePercent: number,
    progressBg: string,
    side: "white" | "black";
    setGamesPopUp: (p: GamesPopup) => void,
    stringKey: string[],
    result: AnalysisReport,
    isPopup: boolean,
    rowGridConst: string;
    index: number;
}
export default function CardPreview({ data, games, scorePercent, progressBg, side, setGamesPopUp, stringKey, result, isPopup, rowGridConst, index }: CardPreview) {
    return (
        <motion.div
            onClick={() => setGamesPopUp({
                opening: data,
                gameIds: stringKey,
                games: result.games
            })}
            className={`${rowGridConst} hover:opacity-75 font-medium cursor-pointer duration-200 
${result?.bestOutcome?.openingName === data.openingName
                    ? `
                bg-linear-to-r
                from-(--accent-muted)
                from-0%
                to-(--bg-secondary)
                to-55%
              border-l
               border-(--accent)
              `
                    : "bg-(--bg-secondary)"
                }`}>
            <span className="text-(--text-muted)">
                {index}
            </span>
            <div className="flex flex-col items-start justify-center gap-1">
                <p className="text-lg font-medium">
                    {data.openingName}
                </p>
                <span className="text-sm text-(--text-muted)">
                    {games} games played
                </span>

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
            <p className="flex flex-col gap-0.5 items-start">
                {scorePercent}%
                <span className={`text-(--text-muted) text-sm`}>
                    score across games
                </span>
            </p>
            <ChevronRight size={12} />
        </motion.div>
    )
}