import { GamesAPIResponse } from "@/api/lib/types";
import { getOpeningGames } from "@/src/lib/services/api-functions";
import { ChevronRight, ChevronsDown } from "lucide-react";
import { Dispatch, SetStateAction, useTransition } from "react";
type GamesLoaded = {
    games: GamesAPIResponse;
    side: "white" | "black";
    username: string;
    opening: string;
    setStatus: Dispatch<SetStateAction<"completed" | "failed" | "not_found" | "processing" | "queued" | null>>;
    setGamesCache: React.Dispatch<
        React.SetStateAction<Map<string, GamesAPIResponse> | null>
    >
    setGames: Dispatch<SetStateAction<GamesAPIResponse | null>>;
}

export default function GamesSection({ games, side, username, opening, setStatus, setGamesCache, setGames }: GamesLoaded) {
    const [isPending, startTransition] = useTransition();
    return (
        <div className="flex flex-col gap-1 overflow-y-auto overscroll-contain rounded-md">
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
                const result = data.result === "black_won" && side === "black" ? "W" : data.result === "white_won" && side === "white" ? "W" :
                    data.result === "white_won" && side === "black" ? "L" : data.result === "black_won" && side === "white" ? "L" : "D";
                const opponent_name = side === "black" ? data.white_username : data.black_username;
                return (
                    <div
                        key={data.id}
                        className={`flex flex-row items-center justify-between py-2 px-4 hover:cursor-pointer hover:bg-(--bg-tertiary) duration-200`}>
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
            {games.hasMore && (
                <div
                    className="flex w-full items-center justify-center">
                    <button
                        onClick={() => {
                            startTransition(async () => {
                                const key = `${username}:${opening}:${side}`;
                                const response = await getOpeningGames(String(games.nextOffset + 1), opening, side, username);
                                if (response.status === "failed" || response.status === "not_found") {
                                    return setStatus(response.status);
                                }
                                if (response.status === "completed") {
                                    setGamesCache(previous => {
                                        const updated = new Map(previous ?? []);
                                        const cached = updated.get(key);
                                        updated.set(key, {...response.profile, games: [...response.profile.games, ...(cached?.games ?? [])]});
                                        return updated;
                                    });
                                    setGames((p) => {
                                        if(!p) return response.profile;
                                        return {
                                            ...response.profile,
                                            games: [
                                                ...p.games,
                                                ...response.profile.games
                                            ]
                                        }
                                    });
                                }
                            });
                        }}
                        disabled={isPending}
                        className="text-(--text-muted) text-sm m-3 cursor-pointer duration-300 items-center justify-center hover:text-(--text-secondary) flex flex-row gap-1">
                        {isPending ? (
                            <span className="loading loading-sm loading-dots" />
                        ) : games.hasMore ? (
                                <>
                                 <ChevronsDown size={14} />
                                 <span className="">
                                     View more games
                                 </span>
                                 </>
                            ) : (
                                <span className = "">
                                    All games listed
                                </span>
                            )}
                    </button>
                </div>
            )}
        </div>
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