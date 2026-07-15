"use client"
import { ReadJobStatus } from "@/src/lib/services/analyze";
import { SetStateAction, useEffect, useMemo, useState } from "react";
import HistoryLoading from "./HistoryLoading";
import { AnalysisReport, GameData, OpeningData } from "@/src/lib/services/types";
import HistoryErrorPage from "./HistoryErrorPage";
import { motion, AnimatePresence, easeInOut } from "motion/react";
import Image from "next/image";
import MetricTemplate from "./MetricTemplate";
import { ChevronDown, ChevronRight, Crosshair, ExternalLink, TimerIcon, Zap } from "lucide-react";
import CardPreview from "./Cards/CardPreview";

export type GamesPopup = {
    opening: OpeningData,
    gameIds: string[],
    games: Record<string, GameData>
}
export default function MainHistoryPage({ slug, uuid }: { slug: string, uuid: string }) {
    const [status, setStatus] = useState<"completed" | "processing" | "queued" | "not_found" | "failed" | null>("queued");
    const [result, setResult] = useState<AnalysisReport | null>(null);
    const [side, setSide] = useState<"white" | "black">("white");
    const [filter, setFilter] = useState<"sorted_asc_games" | "sorted_desc_games" | "sort_asc_accuracy" | "sort_desc_accuracy">("sorted_desc_games");
    const [gamesPopUp, setGamesPopUp] = useState<{ opening: OpeningData, gameIds: string[], games: Record<string, GameData> } | null>(null);
    const rowGridForOpenings = "grid grid-cols-[38px_minmax(0,0.8fr)_minmax(140,0.8fr)_135px_25px] gap-x-4 items-center p-4"
    useMemo(() => {
        let temp;
        switch (filter) {
            case "sort_asc_accuracy": {
                if (side === "white") {
                    temp = result?.openings.sort((a, b) => a.white.whitePercentage - b.white.whitePercentage);
                    break;
                }
                temp = result?.openings.sort((a, b) => a.black.blackPercentage - b.black.blackPercentage);
                break;
            }
            case "sort_desc_accuracy": {
                if (side === "white") {
                    temp = result?.openings.sort((a, b) => b.white.whitePercentage - a.white.whitePercentage);
                    break;
                }
                temp = result?.openings.sort((a, b) => b.black.blackPercentage - a.black.blackPercentage);
                break;
            }
            case "sorted_asc_games": {
                if (side === "white") {
                    temp = result?.openings.sort((a, b) => a.white.whiteGames - b.white.whiteGames);
                    break;
                }
                temp = result?.openings.sort((a, b) => a.black.blackGames - b.black.blackGames);
                break;
            }
            case "sorted_desc_games": {
                if (side === "white") {
                    temp = result?.openings.sort((a, b) => b.white.whiteGames - a.white.whiteGames);
                    break;
                }
                temp = result?.openings.sort((a, b) => b.black.blackGames - a.black.blackGames);
                break;
            }
        }
    }, [result, filter, side]);

    useEffect(() => {
        const interval = setInterval(async () => {
            // accurate to the the way it was set in redis, MUST NEVER BE CHANGED
            const trueJobId = `analysis:${slug}:${uuid}`;

            const response = await ReadJobStatus(trueJobId);
            setStatus(response.status);
            if (response.status === "completed") {
                setResult(response.result);
                clearInterval(interval);
            }
            if (response.status === "not_found" || response.status === "failed") {
                clearInterval(interval);
            }
        }, 2500);
        return () => clearInterval(interval);
    }, [slug, uuid]);
    if (status === "queued" || status === "processing") {
        return <HistoryLoading status={status} username={slug} />
    }
    if (status === "completed") {
        return (
            <>
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
                                className="flex flex-col z-50 w-1/2 min-h-screen max-h-screen bg-(--bg-secondary) shadow-black shadow-md border border-(--accent-muted) overscroll-contain rounded-lg">
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
                                        const date = new Date(game.date)
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
                                            if(Number(timeControl) < 60){
                                                timeControl = String(Number(timeControl)) + "s";
                                            }
                                            else{
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
                                                    <ChevronRight size = {14} strokeWidth={2} className = "text-(--text-muted)" />
                                                </div>

                                            </div>

                                        )
                                    })}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                <div
                    className={`flex min-h-screen w-screen font-sans ${gamesPopUp && "opacity-20 duration-300"}`}>
                    <div className=" flex flex-col items-start justify-center w-full gap-5 lg:mx-32.5 mx-10 mt-18.75">
                        <div className="grid w-full overflow-hidden rounded-md border border-(--border-subtle) bg-(--bg-secondary) shadow-md shadow-black/30 lg:grid-cols-[245px_minmax(0,1fr)]">
                            <div className="flex flex-col items-center justify-center border-b border-(--border-subtle) px-5 py-6 text-center lg:border-r lg:border-b-0">
                                <Image
                                    alt={`${result?.profile.username ?? "Chess player"} profile`}
                                    src={result?.profile.avatar ?? "/blank-profile-black.jpg"}
                                    width={80}
                                    height={80}
                                    quality={100}
                                    className="size-20 rounded-md object-cover shadow-sm shadow-black"
                                    priority
                                />

                                <span className="mt-3 max-w-full truncate text-xl font-semibold">
                                    {result?.profile.username}
                                </span>

                                <a
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    href={`https://www.chess.com/member/${result?.profile.username}`}
                                    className="mt-2 flex items-center gap-1 text-sm text-(--text-muted) transition-colors duration-200 hover:text-(--text-secondary)"
                                >
                                    <ExternalLink size={14} />
                                    View profile
                                </a>
                            </div>

                            <div className="min-w-0">
                                <div className="grid grid-cols-3 border-b border-(--border-subtle)">
                                    <MetricTemplate
                                        label="Rapid"
                                        value={
                                            result?.profile.stats.chess_rapid?.last?.rating ?? "—"
                                        }
                                        icon={TimerIcon}
                                        className="border-r border-(--border-subtle)"
                                        rating
                                    />

                                    <MetricTemplate
                                        label="Blitz"
                                        value={
                                            result?.profile.stats.chess_blitz?.last?.rating ?? "—"
                                        }
                                        icon={Zap}
                                        className="border-r border-(--border-subtle)"
                                        rating
                                    />

                                    <MetricTemplate
                                        label="Bullet"
                                        value={
                                            result?.profile.stats.chess_bullet?.last?.rating ?? "—"
                                        }
                                        icon={Crosshair}
                                        rating
                                    />
                                </div>

                                <div className="grid lg:grid-cols-3 lg:grid-rows-1 grid-rows-3">
                                    <MetricTemplate
                                        label="Score"
                                        value={((result?.overallWinRate ?? 0) * 100).toFixed(2) + "%"}
                                        detail={"overall"}
                                        className="border-r border-(--border-subtle)"
                                    />
                                    <MetricTemplate
                                        label="Most seen opening"
                                        value={result?.highestSeen.openingName ?? "-"}
                                        detail={
                                            result?.highestSeen.count
                                                ? `${result?.highestSeen.count} games`
                                                : undefined
                                        }
                                        className="border-r border-(--border-subtle)"
                                    />
                                    <MetricTemplate
                                        label="Best outcome"
                                        value={result?.bestOutcome.openingName ?? "-"}
                                        detail={((result?.bestOutcome.count ?? 0) * 100).toFixed(2) + "%"}
                                        className="border-r border-(--border-subtle)"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-row w-full items-center justify-between bg-(--bg-secondary) p-2 rounded-md border border-(--accent-muted)">
                            <div className="flex flex-row bg-(--bg-secondary) border border-(--accent-muted) rounded-full p-2">
                                <motion.div
                                    onClick={() => setSide("white")}
                                    className={`flex flex-row gap-1 ${side === "white" && "bg-(--bg-tertiary)"} px-2 py-1 cursor-pointer duration-200 active:scale-95 rounded-full items-center justify-center`}
                                >
                                    <span className="h-4 w-4 border border-(--border-subtle) bg-white rounded-full" />
                                    White
                                </motion.div>
                                <motion.div
                                    onClick={() => setSide("black")}
                                    className={`flex flex-row gap-1 ${side === "black" && "bg-(--bg-tertiary)"} cursor-pointer active:scale-95 duration-200 px-2 py-1 rounded-full items-center justify-center`}
                                >
                                    <span className="h-4 w-4 border border-(--border-subtle) bg-black rounded-full" />
                                    Black
                                </motion.div>
                            </div>
                            <div className="dropdown dropdown-start">
                                <div tabIndex={0}
                                    role="button"
                                    className="bg-(--bg-secondary) border font-bold border-(--accent-muted) gap-1 flex flex-row items-center justify-center p-2 rounded-md">
                                    {filter === "sort_asc_accuracy" ? "Score: Low to high"
                                        : filter === "sort_desc_accuracy" ? "Score: High to low" :
                                            filter === "sorted_asc_games" ? "Games: Low to high"
                                                : filter === "sorted_desc_games" && "Games: High to low"}
                                    <ChevronDown size={14} />

                                </div>
                                <ul tabIndex={-1} className="dropdown-content z-1 w-52  font-semibold bg-(--bg-tertiary) border border-(--accent-muted) rounded-md shadow-sm mt-1 gap-2">
                                    {["sort_asc_accuracy", "sort_desc_accuracy", "sorted_asc_games", "sorted_desc_games"].map((f) => {
                                        if (f === filter) {
                                            return;
                                        }
                                        const name = f === "sort_asc_accuracy" ? "Score: Low to high"
                                            : f === "sort_desc_accuracy" ? "Score: High to low" :
                                                f === "sorted_asc_games" ? "Games: Low to high"
                                                    : f === "sorted_desc_games" && "Games: High to low"
                                        return (
                                            <li
                                                key={f}
                                                onClick={() => setFilter(f as SetStateAction<"sorted_asc_games" | "sorted_desc_games" | "sort_asc_accuracy" | "sort_desc_accuracy">)}
                                                className="w-full last:border-b-0 border-b p-2 border-(--accent-muted) hover:opacity-75 cursor-pointer">
                                                {name}
                                            </li>
                                        )
                                    })}
                                </ul>
                            </div>
                        </div>
                        <span className="text-(--text-muted) tracking-widest text-sm">
                            Opening classification in games as {side}
                        </span>
                        <div className=" flex flex-col w-full  rounded-lg bg-(--bg-secondary) border border-(--accent-muted)">
                            <div className={`${rowGridForOpenings} bg-(--bg-secondary) rounded-t-lg  border-b border-(--accent-muted)`}>
                                <span className="text-(--text-muted) text-sm">
                                    #
                                </span>
                                <span className="text-(--text-muted) text-sm uppercase">
                                    opening
                                </span>
                                <span className="text-(--text-muted) text-sm uppercase">
                                    Record
                                </span>
                                <span className="text-(--text-muted) text-sm uppercase">
                                    Score
                                </span>
                            </div>
                            <AnimatePresence>
                                {result?.openings.map((data, i) => {
                                    const scorePercent = side === "white" ? data.white.whitePercentage : data.black.blackPercentage;
                                    const progressBg = BackgroundPercentageBar(scorePercent);
                                    const stringKey: string[] = data.gameIds;
                                    const games = side === "white" ? data.white.whiteGames : data.black.blackGames;
                                    if (games === 0) {
                                        return;
                                    }
                                    return (
                                        <CardPreview
                                            key={data.openingName}
                                            data={data}
                                            games={games}
                                            progressBg={progressBg}
                                            stringKey={stringKey}
                                            result={result}
                                            side={side}
                                            scorePercent={scorePercent}
                                            setGamesPopUp={setGamesPopUp}
                                            isPopup={false}
                                            rowGridConst={rowGridForOpenings}
                                            index={i + 1}
                                        />
                                    )
                                }
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </>
        )
    }

    if (status === "failed" || status === "not_found") {
        return (
            <HistoryErrorPage />
        )
    }
    return null;
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
function BackgroundPercentageBar(percentage: number): string {
    if (percentage >= 75) {
        return "bg-(--brilliant)"
    }
    if (percentage >= 50) {
        return "bg-(--success)"
    }
    if (percentage >= 30) {
        return "bg-(--warning)"
    }
    return "bg-(--danger)"
}

