import { GamesAPIResponse } from "@/api/lib/types";
import { AnalysisReport } from "@/src/lib/services/types";
import { AnimatePresence, motion, easeInOut } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { GamesPopUp } from "./MainHistoryPage";

type GameSideBarProps = {
    gamesPopUp: GamesPopUp | null;
    games: GamesAPIResponse | null;
    setGamesPopUp: (p: GamesPopUp | null) => void;
    side: string
}
export default function GameSideBar({ gamesPopUp, setGamesPopUp, side, games }: GameSideBarProps) {
    return (
        <AnimatePresence>
            {gamesPopUp && games && (
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
                                {gamesPopUp.opening_name}
                            </p>

                            <div className="flex flex-row gap-1 items-center justify-center text-sm font-semibold">
                                <span className="text-(--success)">
                                    {gamesPopUp.wins}W
                                </span>
                                <span>
                                    {gamesPopUp.draws}D
                                </span>
                                <span className="text-(--danger)">
                                    {gamesPopUp.losses}L
                                </span>
                                <span className="">
                                    as {side}
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1 overflow-y-auto rounded-md">
                            {games.games.map((data) => {
                                const months = ["January", "Febuary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                                const date = new Date(data.played_at * 1000);
                                const gameDate = months[date.getMonth()] + " " + String(date.getDate());
                                const color = ColorSelector(data.result);
                                const timeClass = data.time_class[0].toUpperCase() + data.time_class.slice(1);
                                let increment = "";
                                let timeControlFixed = ""
                                let timeControl = data.time_control;
                                if (data.time_control.includes("+")) {
                                    const temp = data.time_control
                                    const index = data.time_control.indexOf("+");
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
                                const result = data.result === "black_won" && side === "black" ? "W" : data.result === "draw" ? "D" : "L";
                                const opponent_name = side === "black" ? data.white_username : data.black_username;
                                return (
                                    <div
                                        key={data.id}
                                        className={`flex flex-row items-center justify-between py-2 px-4  hover:cursor-pointer hover:bg-(--bg-tertiary) duration-200`}>
                                        <div className="flex flex-row items-center gap-3">
                                            <span className={`${color} font-bold text-sm w-7 h-7 shrink-0 flex items-center justify-center rounded-md ${result === "W" ? "text-(--success) bg-(--success)/20" : result === "L" ? "text-(--danger) bg-(--danger)/20" : "text-(--accent-muted) bg-(--accent-muted)"}`}>
                                                {result}
                                            </span>
                                            <div className="flex flex-col gap-0.5 items-start justify-center">
                                                <p className="font-semibold">
                                                    {opponent_name}
                                                </p>
                                                <p className="text-sm text-(--text-secondary)">
                                                    {data.opening}{data.opening_variation && ": "} {data.opening_variation}
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