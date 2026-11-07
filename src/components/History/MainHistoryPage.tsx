"use client"
import { SetStateAction, useMemo, useState, useTransition } from "react";
import HistoryLoading from "./HistoryLoading";
import HistoryErrorPage from "./HistoryErrorPage";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import MetricTemplate from "./MetricTemplate";
import { ChessPawn, ChevronDown, ChevronRight, CircleCheck, CircleEqual, CircleX, Crosshair, ExternalLink, Handshake, TimerIcon, Zap } from "lucide-react";
import CardPreview from "./Cards/CardPreview";
import useHistory from "@/src/hooks/useHistory";
import GameSideBar from "./GameSidebar";
import { ChessComPlayerResult, GameOutcome, GamesAPIResponse } from "@/api/lib/types";
import { getEveryGame } from "@/src/lib/services/api-functions";
import { useRouter } from "next/navigation";
export type GamesPopUp = {
    opening_name: string, wins: number, losses: number, draws: number;
}
export default function MainHistoryPage({ slug, uuid }: { slug: string, uuid: string }) {
    const [side, setSide] = useState<"white" | "black">("white");
    const [gamesCache, setGamesCache] = useState<Map<string, GamesAPIResponse> | null>(null);
    const [games, setGames] = useState<GamesAPIResponse | null>(null);
    const [allGames, setAllGames] = useState<GamesAPIResponse | null>(null);
    const [filter, setFilter] = useState<"sorted_asc_games" | "sorted_desc_games" | "sort_asc_accuracy" | "sort_desc_accuracy">("sorted_desc_games");
    const [gamesPopUp, setGamesPopUp] = useState<GamesPopUp | null>(null);
    const rowGridForOpenings = "hidden md:grid grid-cols-[38px_minmax(0,0.8fr)_minmax(140,0.8fr)_135px_25px] gap-x-4 items-center p-4"
    const { result, status, errorMsg, setStatus } = useHistory(slug, uuid);
    const [dataView, setDataView] = useState<"games" | "openings">("openings");
    const [isPending, startTransition] = useTransition();
    const [gamesPending, startGamesTransition] = useTransition();
    const allGamesGrid = "grid grid-cols-[minmax(180px,1.1fr)_minmax(190px,1.4fr)_120px_90px_80px_24px] items-center justify-items-start gap-x-4 px-4"
    const router = useRouter();
    const resultLegend = [
        {
            label: "Win",
            Icon: CircleCheck,
            color: "text-(--success)",
        },
        {
            label: "Draw",
            Icon: Handshake,
            color: "text-(--accent)",
        },
        {
            label: "Loss",
            Icon: CircleX,
            color: "text-(--danger)",
        },
    ];
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
        if (!result) {
            return null;
        }
        return (
            <>
                <GameSideBar
                    isPending={isPending}
                    gamesPopUp={gamesPopUp}
                    games={games}
                    setGamesPopUp={setGamesPopUp}
                    side={side}
                    username={result?.username}
                    setStatus={setStatus}
                    setGamesCache={setGamesCache}
                    setGames={setGames}
                />
                <div
                    className={`flex min-h-screen w-full max-w-screen font-sans ${gamesPopUp && "opacity-20 duration-300"} `}>
                    <div className=" flex flex-col items-start  w-full gap-3 mx-10 mt-18.75">
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
                            <button

                                onClick={() => {
                                    setDataView("games")
                                    if (allGames) return;

                                    startGamesTransition(async () => {
                                        const offset = "0";
                                        const response = await getEveryGame(offset, result.username);
                                        if (response.status === "failed" || response.status === "not_found") {
                                            return setStatus(response.status);
                                        }
                                        if (response.status === "completed") {
                                            setAllGames(response.profile);
                                        }
                                    })
                                }}
                                className={`${dataView === "games" && "border-b-2 border-b-(--accent) text-(--text-primary) opacity-100"} p-2 flex items-center duration-200 justify-center gap-1 text-(--text-muted) opacity-75 cursor-pointer`}>
                                Games {''}
                                <span
                                    className={`px-2 py-1 bg-(--accent-muted) font-semibold text-xs rounded-lg ${dataView === "games" && "text-(--accent)"}`}>
                                    {result?.total_games}
                                </span>
                            </button>
                        </div>
                        {dataView == "openings" && (
                            <div className="flex flex-col items-start justify-center gap-5 w-full">
                                <div className="flex flex-col gap-2 md:flex-row w-full items-center justify-between bg-(--bg-secondary) p-2 rounded-md border border-(--accent-muted)">
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
                                <p className="flex flex-row w-full justify-between text-(--text-muted) items-center tracking-widest text-sm">
                                    <span className="">
                                        Opening classification in games as {side}
                                    </span>
                                    <span className="text-sm    ">
                                        Game history based off the last six months
                                    </span>
                                </p>
                                <div className="flex flex-col w-full">
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
                                                    games={games}
                                                    setGames={setGames}
                                                    key={data.openingName}
                                                    data={data}
                                                    gamesCache={gamesCache}
                                                    openingGameCount={openingGameCount}
                                                    profile={result}
                                                    side={side}
                                                    scorePercent={scorePercent}
                                                    setGamesPopUp={setGamesPopUp}
                                                    isPopup={false}
                                                    rowGridConst={rowGridForOpenings}
                                                    index={i + 1}
                                                    isPending={isPending}
                                                    startTransition={startTransition}
                                                    username={result.username}
                                                    setGamesCache={setGamesCache}
                                                    setStatus={setStatus}
                                                />
                                            )
                                        }
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        )}
                        {dataView === "games" && (
                            <div className="flex flex-col w-full">
                                <div className="flex items-center gap-4 h-full py-2">
                                    {resultLegend.map(({ label, Icon, color }) => (
                                        <div
                                            key={label}
                                            className="flex items-center gap-1.5 text-xs text-(--text-muted)"
                                        >
                                            <Icon
                                                className={`size-4.5 ${color}`}
                                                strokeWidth={2}
                                            />
                                            <span>{label}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className={`${allGamesGrid} border border-(--accent-muted) rounded-t-md py-4 bg-(--bg-secondary) text-(--text-muted) uppercase text-sm`}>
                                    <p className="">
                                        Players
                                    </p>
                                    <p className="">
                                        Opening
                                    </p>
                                    <p className="">
                                        Result
                                    </p>
                                    <p className="">
                                        Date
                                    </p>
                                    <p className="">
                                        Accuracy
                                    </p>
                                    <p className="">

                                    </p>
                                </div>
                                {gamesPending ? (
                                    <div
                                        className="min-h-80 "
                                        aria-busy="true"
                                        aria-label="Loading games"
                                    >
                                        {Array.from({ length: 20 }).map((_, index) => (
                                            <div
                                                key={index}
                                                className={`${allGamesGrid} animate-pulse`}>

                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col w-full items-start justify-center">
                                        {allGames?.games.map((games, i) => {
                                            const months = ["January", "Febuary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                                            const date = new Date(games.played_at * 1000);
                                            const gameDate = months[date.getMonth()] + " " + String(date.getDate());
                                            const gameResult = result.username === games.white_username ? games.white_ending : games.black_ending;
                                            const trueResult = getGameOutcomeClient(gameResult);
                                            const displayResult = trueResult[0].toLocaleUpperCase() + trueResult.slice(1);
                                            const bgColor = i % 2 === 0 ? "bg-(--bg-primary)" : "bg-(--bg-secondary)"
                                            const ResultIcon =
                                                trueResult === "win"
                                                    ? CircleCheck
                                                    : trueResult === "loss"
                                                        ? CircleX
                                                        : Handshake;
                                            return (
                                                <div
                                                    key={`${games.id}-all-games`}
                                                    onClick={() => router.push(`/games/review/${games.id}?perspective=${result.username}&pfp_url=${result.profile_pic}&move=0`)}
                                                    className={`
                                                    ${allGamesGrid} min-w-0 py-2 w-full overflow-hidden
                                                    transition-colors ${bgColor} hover:bg-(--bg-tertiary)
                                                `}
                                                >
                                                    <div className="flex min-w-0 flex-col gap-2  py-3">
                                                        <div className="flex items-center gap-2">
                                                            <span className="
                                                            flex h-5 w-5 items-center justify-center
                                                            rounded-sm border border-(--border-default)
                                                            bg-white text-[12px] text-black
                                                        ">
                                                                {games.white_username === result.username ? (
                                                                    <Image
                                                                        alt={`${result?.username ?? "Chess player"} profile`}
                                                                        src={result?.profile_pic ?? "/default-pfp-dark.jpg"}
                                                                        width={80}
                                                                        height={80}
                                                                        quality={100}
                                                                        sizes = "800px"
                                                                        loading = "lazy"
                                                                        className=" rounded-md object-cover shadow-sm shadow-black"
                                                                    />) : (
                                                                    <span className="">
                                                                        &#9823;
                                                                    </span>
                                                                )}
                                                            </span>

                                                            <p className="truncate font-semibold">
                                                                {games.white_username}
                                                            </p>

                                                            <span className="
                                                            rounded bg-white/5 px-1.5 py-0.5
                                                            text-xs tabular-nums text-(--text-muted)
                                                        ">
                                                                {games.white_rating ?? "—"}
                                                            </span>
                                                        </div>

                                                        <div className="flex flex-row items-center gap-2">
                                                            <span className="
                                                            flex h-5 w-5 items-center justify-center
                                                            rounded-sm border border-(--border-default)
                                                            bg-(--bg-secondary) text-[12px] text-white
                                                        ">
                                                                {games.black_username === result.username ? (
                                                                    <Image
                                                                        alt={`${result?.username ?? "Chess player"} profile`}
                                                                        src={result?.profile_pic ?? "/default-pfp-dark.jpg"}
                                                                        width={80}
                                                                        height={80}
                                                                        quality={100}
                                                                        sizes = "800px"
                                                                        loading = "lazy"
                                                                        className=" rounded-md object-cover shadow-sm shadow-black"
                                                                    />) : (
                                                                    <span className="">
                                                                        &#9823;
                                                                    </span>
                                                                )}
                                                            </span>

                                                            <p className="truncate font-semibold">
                                                                {games.black_username}
                                                            </p>

                                                            <span className="
                                                            rounded bg-white/5 px-1.5 py-0.5
                                                            text-xs tabular-nums text-(--text-muted)
                                                        ">
                                                                {games.black_rating ?? "—"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex min-w-0 flex-col gap-2 ">
                                                        <p className="font-semibold truncate tracking-wide text-(--accent)">
                                                            {games.opening}
                                                        </p>
                                                        {games.opening_variation ? (
                                                            <p className="font-semibold truncate tracking-wide text-sm text-(--text-muted)">
                                                                {games.opening_variation}
                                                            </p>
                                                        ) : (
                                                            <p className="font-semibold tracking-wide text-sm text-(--text-muted)">
                                                                Main line
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-row gap-1">
                                                        <p className="text-(--text-muted) text-sm">
                                                            <ResultIcon
                                                                className={`size-6 ${trueResult === "win"
                                                                    ? "text-(--success)"
                                                                    : trueResult === "loss"
                                                                        ? "text-(--danger)"
                                                                        : "text-(--accent)"
                                                                    }`}
                                                            />
                                                        </p>
                                                    </div>
                                                    <div className="flex flex-col gap-1">
                                                        <p className="text-(--accent) font-semibold">
                                                            {gameDate}
                                                        </p>
                                                        <p className="text-(--text-muted) text-sm">
                                                            {date.getFullYear()}
                                                        </p>
                                                    </div>
                                                    <div className="flex justify-self-center">
                                                        <p className="text-(--text-muted) text-sm">
                                                            -
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center justify-start">
                                                        <ChevronRight className="size-4 text-(--text-muted)" />
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div >
            </>
        )
    }

    if (status === "failed" || status === "not_found") {
        return (
            <HistoryErrorPage errorMsg={errorMsg} />
        )
    }
    return null;
}

function getGameOutcomeClient(res: ChessComPlayerResult | string): "loss" | "win" | "draw" {
    switch (res) {
        case "win":
            return "win";

        case "agreed":
        case "repetition":
        case "stalemate":
        case "insufficient":
        case "50move":
        case "timevsinsufficient":
            return "draw";

        case "checkmated":
        case "timeout":
        case "resigned":
        case "lose":
        case "abandoned":
        case "kingofthehill":
        case "threecheck":
            return "loss";

        default:
            return "loss";
    }
}

