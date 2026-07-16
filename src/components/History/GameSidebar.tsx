import { AnalysisReport } from "@/src/lib/services/types";
import { AnimatePresence, motion, easeInOut } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { GamesPopup } from "./MainHistoryPage";

type GameSideBarProps = {
    gamesPopUp: GamesPopup | null;
    result: AnalysisReport | null;
    setGamesPopUp: (p: GamesPopup | null) => void;
    side: string
}
export default function GameSideBar({gamesPopUp, result, setGamesPopUp, side} : GameSideBarProps) {
    return (
        <AnimatePresence>
            {gamesPopUp && result && (
                <motion.div
                    initial={{ opacity: 0.3, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    transition={{ duration: 0.24, ease: easeInOut }}
                    className="w-screen inset-0 h-screen items-center fixed justify-end flex z-50 overscroll-contain"
                    onClick={() => setGamesPopUp(null)}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        className="flex flex-col z-50 w-1/2 min-h-screen max-h-screen bg-(--bg-secondary) shadow-black shadow-xs border border-(--accent-muted) overscroll-contain rounded-lg">
                        <div className="flex flex-col border-b border-(--accent-muted) gap-1 p-5 items-start justify-center bg-[radial-gradient(circle_at_-55%_-25%,var(--accent-muted),transparent_72%)]">
                            <p className="text-2xl font-semibold">
                                {gamesPopUp.opening.openingName}
                            </p>

                            <div className="flex flex-row gap-1 items-center justify-center text-sm font-semibold">
                                <span className="text-(--success)">
                                    {side === "white" ? gamesPopUp.opening.white.whiteWins : gamesPopUp.opening.black.blackWins}W
                                </span>
                                <span>
                                    {side === "white" ? gamesPopUp.opening.white.whiteDraws : gamesPopUp.opening.black.blackDraws}D
                                </span>
                                <span className="text-(--danger)">
                                    {side === "white" ? gamesPopUp.opening.white.whiteLosses : gamesPopUp.opening.black.blackLosses}L
                                </span>
                                <span className="">
                                    as {side}
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1 overflow-y-auto rounded-md">
                            {gamesPopUp.gameIds.map((id) => {
                                const game = gamesPopUp.games[id];
                                if (!game) {
                                    return;
                                }
                                if (game.userColor !== side) {
                                    return;
                                }
                                const months = ["January", "Febuary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                                const date = new Date(game.date * 1000);
                                const gameDate = months[date.getMonth()] + " " + String(date.getDate());
                                const color = ColorSelector(game.result);
                                const timeClass = game.timeClass[0].toUpperCase() + game.timeClass.slice(1);
                                let increment = "";
                                let timeControlFixed = ""
                                let timeControl = game.timeControl;
                                if (game.timeControl.includes("+")) {
                                    const temp = game.timeControl
                                    const index = game.timeControl.indexOf("+");
                                    increment = temp.slice(index + 1);
                                    timeControlFixed = temp.slice(0, index)
                                }
                                if (increment) {
                                    if (Number(timeControlFixed) < 60) {
                                        timeControl = (Number(timeControlFixed)) + "s" + "|" + increment;
                                    }
                                    else {
                                        timeControl = (Number(timeControlFixed) / 60) + "m" + " | " + increment;
                                    }
                                }
                                else {
                                    if (Number(timeControl) < 60) {
                                        timeControl = String(Number(timeControl)) + "s";
                                    }
                                    else {
                                        timeControl = String(Number(timeControl) / 60) + "m";
                                    }
                                }
                                return (
                                    <div
                                        key={id}
                                        className={`flex flex-row items-center justify-between py-2 px-4  hover:cursor-pointer hover:bg-(--bg-tertiary) duration-200`}>
                                        <div className="flex flex-row items-center gap-3">
                                            <span className={`${color} font-bold text-sm w-7 h-7 shrink-0 flex items-center justify-center rounded-md ${game.result === "win" ? "text-(--success) bg-(--success)/20" : game.result === "loss" ? "text-(--danger) bg-(--danger)/20" : "text-(--accent-muted) bg-(--accent-muted)"}`}>
                                                {game.result === "win" ? "W" : game.result === "draw" ? "D" : "L"}
                                            </span>
                                            <div className="flex flex-col gap-0.5 items-start justify-center">
                                                <p className="font-semibold">
                                                    {game.opponentUsername}
                                                </p>
                                                <p className="text-sm text-(--text-secondary)">
                                                    {game.openingName}{game.openingVariation && ": "} {game.openingVariation}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex flex-row items-center justify-center gap-1">
                                            <div className="flex flex-col gap-1 items-center justify-center">
                                                <span className="text-(--text-muted) text-sm">
                                                    {gameDate}
                                                </span>
                                                <span className="text-(--text-muted) text-sm">
                                                    {timeClass} {' '} {timeControl}
                                                </span>
                                            </div>
                                            <ChevronRight size={14} strokeWidth={2} className="text-(--text-muted)" />
                                        </div>

                                    </div>

                                )
                            })}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

function ColorSelector(result: string): string {
    if (result === "win") {
        return "text-(--success)"
    }
    if (result === "draw") {
        return "text-(--warning)"
    }
    return "text-(--danger)"
}