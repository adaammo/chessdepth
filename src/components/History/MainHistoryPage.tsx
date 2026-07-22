"use client"
import { SetStateAction, useMemo, useState, useTransition } from "react";
import HistoryLoading from "./HistoryLoading";
import { GameData, OpeningData } from "@/src/lib/services/types";
import HistoryErrorPage from "./HistoryErrorPage";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import MetricTemplate from "./MetricTemplate";
import { ChevronDown, Crosshair, ExternalLink, TimerIcon, Zap } from "lucide-react";
import CardPreview from "./Cards/CardPreview";
import useHistory from "@/src/hooks/useHistory";
import GameSideBar from "./GameSidebar";
import { GamesAPIResponse } from "@/api/lib/types";
export type GamesPopUp = {
    opening_name: string, wins: number, losses: number, draws: number;
}
export default function MainHistoryPage({ slug, uuid }: { slug: string, uuid: string }) {
    const [side, setSide] = useState<"white" | "black">("white");
    const [games, setGames] = useState<GamesAPIResponse | null>(null);
    const [filter, setFilter] = useState<"sorted_asc_games" | "sorted_desc_games" | "sort_asc_accuracy" | "sort_desc_accuracy">("sorted_desc_games");
    const [gamesPopUp, setGamesPopUp] = useState<GamesPopUp | null>(null);
    const rowGridForOpenings = "grid grid-cols-[38px_minmax(0,0.8fr)_minmax(140,0.8fr)_135px_25px] gap-x-4 items-center p-4"
    const { result, status, setStatus } = useHistory(slug, uuid);
    const [dataView, setDataView] = useState<"games" | "openings">("openings");
    const [isPending, startTransition] = useTransition();
    useMemo(() => {
        switch (filter) {
            case "sort_asc_accuracy": {
                if (side === "white") {
                    result?.opening_stats.sort((a, b) => a.white.whitePercentage - b.white.whitePercentage);
                    break;
                }
                result?.opening_stats.sort((a, b) => a.black.blackPercentage - b.black.blackPercentage);
                break;
            }
            case "sort_desc_accuracy": {
                if (side === "white") {
                    result?.opening_stats.sort((a, b) => b.white.whitePercentage - a.white.whitePercentage);
                    break;
                }
                result?.opening_stats.sort((a, b) => b.black.blackPercentage - a.black.blackPercentage);
                break;
            }
            case "sorted_asc_games": {
                if (side === "white") {
                    result?.opening_stats.sort((a, b) => a.white.whiteGames - b.white.whiteGames);
                    break;
                }
                result?.opening_stats.sort((a, b) => a.black.blackGames - b.black.blackGames);
                break;
            }
            case "sorted_desc_games": {
                if (side === "white") {
                    result?.opening_stats.sort((a, b) => b.white.whiteGames - a.white.whiteGames);
                    break;
                }
                result?.opening_stats.sort((a, b) => b.black.blackGames - a.black.blackGames);
                break;
            }
        }
    }, [result, filter, side]);

    if (status === "queued" || status === "processing") {
        return <HistoryLoading status={status} username={slug} />
    }
    if (status === "completed") {
        return (
            <>
                <GameSideBar
                    gamesPopUp={gamesPopUp}
                    games = {games}
                    setGamesPopUp={setGamesPopUp}
                    side={side}
                />
                <div
                    className={`flex min-h-screen w-screen font-sans ${gamesPopUp && "opacity-20 duration-300"}`}>
                    <div className=" flex flex-col items-start  w-full gap-5 lg:mx-32.5 mx-10 mt-18.75">
                        <div className="grid w-full overflow-hidden rounded-md border border-(--border-subtle) bg-(--bg-secondary) shadow-md shadow-black/30 lg:grid-cols-[245px_minmax(0,1fr)]">
                            <div className="flex flex-col items-center justify-center border-b border-(--border-subtle) px-5 py-6 text-center lg:border-r lg:border-b-0">
                                <Image
                                    alt={`${result?.username ?? "Chess player"} profile`}
                                    src={result?.profile_pic ?? "/default-pfp-dark.jpg"}
                                    width={80}
                                    height={80}
                                    quality={100}
                                    className="size-20 rounded-md object-cover shadow-sm shadow-black"
                                    priority
                                />

                                <span className="mt-3 max-w-full truncate text-xl font-semibold">
                                    {result?.username}
                                </span>

                                <a
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    href={`https://www.chess.com/member/${result?.profile_url}`}
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
                                            result?.rapid_rating ?? "—"
                                        }
                                        icon={TimerIcon}
                                        className="border-r border-(--border-subtle)"
                                        rating
                                    />

                                    <MetricTemplate
                                        label="Blitz"
                                        value={
                                            result?.blitz_rating ?? "—"
                                        }
                                        icon={Zap}
                                        className="border-r border-(--border-subtle)"
                                        rating
                                    />

                                    <MetricTemplate
                                        label="Bullet"
                                        value={
                                            result?.bullet_rating ?? "—"
                                        }
                                        icon={Crosshair}
                                        rating
                                    />
                                </div>

                                <div className="grid lg:grid-cols-3 lg:grid-rows-1 grid-rows-3">
                                    <MetricTemplate
                                        label="Score"
                                        value={((result?.win_rate ?? 0) * 100).toFixed(2) + "%"}
                                        detail={"overall"}
                                        className="border-r border-(--border-subtle)"
                                    />
                                    <MetricTemplate
                                        label="Most seen opening"
                                        value={result?.highest_seen_opening ?? "-"}
                                        detail={
                                            result?.highest_seen_opening_count
                                                ? `${result?.highest_seen_opening_count} games`
                                                : undefined
                                        }
                                        className="border-r border-(--border-subtle)"
                                    />
                                    <MetricTemplate
                                        label="Best outcome"
                                        value={result?.best_outcome_opening ?? "-"}
                                        detail={((result?.best_outcome_opening_count ?? 0) * 100).toFixed(2) + "%"}
                                        className="border-r border-(--border-subtle)"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3 w-full border-b border-(--accent-muted) font-medium items-center justify-start">
                            <p
                                onClick={() => setDataView("openings")}
                                className={`${dataView === "openings" && "border-b-2 border-b-(--accent) text-(--text-primary) opacity-100"} p-2 flex items-center duration-200 justify-center gap-1 text-(--text-muted) opacity-75 cursor-pointer`}>
                                Openings {''}
                                <span
                                    className={`px-2 py-1 bg-(--accent-muted) font-semibold text-xs rounded-lg ${dataView === "openings" && "text-(--accent)"}`}>
                                    {result?.opening_stats.length}
                                </span>
                            </p>
                            <p
                                onClick={() => setDataView("games")}
                                className={`${dataView === "games" && "border-b-2 border-b-(--accent) text-(--text-primary) opacity-100"} p-2 flex items-center duration-200 justify-center gap-1 text-(--text-muted) opacity-75 cursor-pointer`}>
                                Games {''}
                                <span
                                    className={`px-2 py-1 bg-(--accent-muted) font-semibold text-xs rounded-lg ${dataView === "games" && "text-(--accent)"}`}>
                                    {result?.total_games}
                                </span>
                            </p>
                        </div>
                        {dataView == "openings" && (
                            <div className="flex flex-col items-start justify-center gap-5 w-full">
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
                                <div className=" flex flex-col w-full">
                                    <div className={`${rowGridForOpenings} bg-(--bg-secondary) rounded-t-lg  border border-(--accent-muted)`}>
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
                                        {result?.opening_stats.map((data, i) => {
                                            const scorePercent = side === "white" ? data.white.whitePercentage : data.black.blackPercentage;
                                            const openingGameCount = side === "white" ? data.white.whiteGames : data.black.blackGames;
                                            if (openingGameCount === 0) {
                                                return;
                                            }
                                            return (
                                                <CardPreview
                                                    key={data.openingName}
                                                    data={data}
                                                    games = {games}
                                                    openingGameCount={openingGameCount}
                                                    profile={result}
                                                    side={side}
                                                    scorePercent={scorePercent}
                                                    setGamesPopUp={setGamesPopUp}
                                                    isPopup={false}
                                                    rowGridConst={rowGridForOpenings}
                                                    index={i + 1}
                                                    isPending = {isPending}
                                                    startTransition = {startTransition}
                                                    username = {result.username}
                                                    setGames = {setGames}
                                                    setStatus = {setStatus}
                                                />
                                            )
                                        }
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        )}
                        {dataView === "games" && (
                            <div className="flex flex-col items-start justify-center gap-5 w-full">

                            </div>
                        )}
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

