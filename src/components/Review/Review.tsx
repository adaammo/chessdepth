"use client"
import { GamesDatabase } from "@/api/lib/types";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { Chessboard } from "react-chessboard"
import { Chess, type Move } from "chess.js"
import { ChevronLeft, ChevronRight, LoaderCircle, RotateCcw, StepBack, StepForward } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createStockfishWorker, EvaluateGame } from "./stockfish";
import { CustomChessBoard } from "@/src/lib/chess-board-helpers";
import { DEFAULT_FEN, pieceTypes } from "@/src/lib/constants";
import { AnalyzedOutput } from "@/src/lib/services/types";
import ReviewLoadingSidebar from "./ReviewLoading";
const FIRST_ANIMATION = true;

export default function Review({ game, perspective, pfp_url, move }: { game: GamesDatabase, perspective: string, pfp_url: string, move: number }) {
    const [loadingAnim, setLoadingAnim] = useState<string>(DEFAULT_FEN);
    const [currentMove, setCurrentMove] = useState<number>(move);
    const [isAnalyzing, setIsAnalyzing] = useState<boolean>(FIRST_ANIMATION);
    const [analysisFrame, setAnalysisFrame] = useState<{ fen: string, moveIndex: number } | null>(null)
    const [analyzed, setAnalyzed] = useState<AnalyzedOutput | null>(null)
    const [analysisError, setAnalysisError] = useState<string | null>(null);

    const { history } = useMemo(() => {
        if (!game.pgn) {
            return {
                history: [] as Move[],
            };
        }

        const loadedGame = new Chess();
        loadedGame.loadPgn(game.pgn);

        const loadedHistory = loadedGame.history({
            verbose: true,
        });

        return {
            history: loadedHistory,
        };
    }, [game.pgn]);
    const fen = currentMove === 0 ? DEFAULT_FEN : history[currentMove - 1].after
    const completedMoves = Math.min(analysisFrame?.moveIndex ?? 0, history.length);
    const totalFullMoves = Math.ceil(history.length / 2);
    const currentFullMove = Math.min(totalFullMoves, Math.floor(completedMoves / 2) + 1);
    const progress = history.length === 0 ? 0 : Math.round((completedMoves / history.length) * 100);
    const displayedMoveIndex =
        isAnalyzing && analysisFrame
            ? analysisFrame.moveIndex
            : currentMove;

    const displayedMove = history[displayedMoveIndex - 1];

    const specificStyles = !displayedMove ? {} : {
        [displayedMove.from]: { backgroundColor: "var(--accent-deep)", borderColor: "var(--accent-deep)" },
        [displayedMove.to]: { backgroundColor: "#dccfb1", borderColor: "var(--accent-deep)" },
        ...(currentMove === history.length
            ? {
                [
                    game.result === "black_won"
                        ? history.findLast(
                            (f) => f.piece === "k" && f.color === "w"
                        )?.to ?? ""
                        : history.findLast(
                            (f) => f.piece === "k" && f.color === "b"
                        )?.to ?? ""
                ]: {
                    backgroundColor: "var(--danger)",
                    borderColor: "var(--danger)",
                },
            }
            : {}),
    };
    useEffect(() => {
        const worker = createStockfishWorker()
        const analyze = async () => {
            const res = await EvaluateGame({ worker, history, setLoadingAnim, onMoveChange: setAnalysisFrame })
                .finally(() => {
                    setLoadingAnim(DEFAULT_FEN)
                    setIsAnalyzing(false);
                })
            if (!res) {
                setAnalysisError("Something broke with stockfish... please reload.")
            }
            setAnalyzed(res);
        }
        void analyze();
        return () => {
            worker.terminate();
        };
    }, [history]);

    const [side, setSide] = useState<"black" | "white">(game.black_username === perspective ? "black" : "white")
    const [sideSelect, setSideSelect] = useState<"analysis" | "summary">("summary")

    const router = useRouter()
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const pieces = Object.fromEntries(pieceTypes.map((p) => [
        p,
        () => (
            <Image
                width={100}
                height={100}
                alt={p}
                src={`/maestro-chess-pieces/${p}.svg`}
                className="object-contain"
                draggable={false}
                loading="eager"
            />
        )
    ]))
    const chessBoardOptions = CustomChessBoard(isAnalyzing ? loadingAnim : fen, side, specificStyles, pieces);
    return (
        <div className="flex flex-col lg:grid lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] items-start min-w-0 w-full py-3 px-10 mt-3 overflow-hidden gap-4">
            <div className="flex flex-col gap-3 items-center justify-center w-full min-h-[90dvh] min-w-0">
                {game.white_username == perspective ? (
                    <section className="flex w-full justify-between items-center font-light">
                        <div className="flex rounded-md gap-1 items-center justify-center border border-(--border-subtle) bg-white shadow-sm shadow-black text-black font-semibold px-2 py-1">
                            <Image
                                alt="user-profile-pic"
                                src={pfp_url ?? "/default-pfp-dark.jpg"}
                                height={25}
                                width={25}
                                className="rounded-md object-contain"
                                sizes="800px"
                            />
                            <span className="text-xs">
                                {perspective}
                            </span>
                            <span className="text-xs">
                                &bull; {game.white_rating}
                            </span>
                        </div>
                        <div className="flex rounded-md gap-1 text-white items-center justify-center border border-(--border-subtle) bg-black shadow-sm shadow-black font-semibold px-2 py-1">
                            <Image
                                alt="user-profile-pic"
                                src={"/default-pfp-dark.jpg"}
                                height={25}
                                width={25}
                                className="rounded-md object-contain"
                                sizes="800px"
                            />
                            <span className="text-xs">
                                {game.black_username}
                            </span>
                            <span className="text-xs">
                                &bull; {game.black_rating}
                            </span>
                        </div>
                    </section>
                ) : (
                    <section className="flex w-full justify-between items-center font-light">
                        <div className="flex rounded-md gap-1 items-center text-white justify-center border border-(--border-subtle) bg-black shadow-sm shadow-black font-semibold px-2 py-1">
                            <Image
                                alt="user-profile-pic"
                                src={pfp_url ?? "/default-pfp-dark.jpg"}
                                height={25}
                                width={25}
                                className="rounded-md object-contain"
                                sizes="800px"
                            />
                            <span className="text-xs">
                                {perspective}
                            </span>
                            <span className="text-xs">
                                &bull; {game.black_rating}
                            </span>
                        </div>
                        <div className="flex rounded-md gap-1 items-center justify-center border border-(--border-subtle) bg-white shadow-sm shadow-black text-black font-semibold px-2 py-1">
                            <Image
                                alt="user-profile-pic"
                                src={"/default-pfp-dark.jpg"}
                                height={25}
                                width={25}
                                className="rounded-md object-contain"
                                sizes="800px"
                            />
                            <span className="text-xs">
                                {game.white_username}
                            </span>
                            <span className="text-xs">
                                &bull; {game.white_rating}
                            </span>
                        </div>
                    </section>
                )}
                <div className="w-full aspect-square">
                    <Chessboard options={chessBoardOptions} />
                </div>

            </div>

            <div className="grid grid-rows-[minmax(0,70px)_minmax(0,35px)_minmax(0,1fr)_30px] min-w-0 py-3 bg-(--bg-secondary) gap-3 h-full rounded-md border border-(--accent-muted)">
                <div className="flex justify-between items-center min-w-0 px-5">
                    <div className="flex items-center gap-1">
                        <Image
                            alt="user-profile-pic"
                            src={game.white_username === perspective ? pfp_url ?? "/default-pfp-dark.jpg" : "/default-pfp-dark.jpg"}
                            height={55}
                            width={55}
                            className="rounded-md object-contain"
                            sizes="800px"
                        />
                        <div className="flex flex-col items-start justify-center gap-0.5">
                            <p className="font-medium text-sm">
                                {game.white_username}
                            </p>
                            <p className="text-(--text-muted) text-xs">
                                {game.white_rating}
                            </p>
                        </div>
                    </div>
                    <div className="flex self-center px-4 py-1 text-xs rounded-xl border border-(--border-subtle) bg-(--bg-primary)">
                        <span className="text-(--text-secondary) font-light">
                            {game.result === "white_won" ? "1-0" : "0-1"}
                        </span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="flex flex-col items-end justify-center gap-0.5">
                            <p className="font-medium text-sm">
                                {game.black_username}
                            </p>
                            <p className="text-(--text-muted) text-xs">
                                {game.black_rating}
                            </p>
                        </div>
                        <Image
                            alt="user-profile-pic"
                            src={game.black_username === perspective ? pfp_url ?? "/default-pfp-dark.jpg" : "/default-pfp-dark.jpg"}
                            height={55}
                            width={55}
                            className="rounded-md object-contain"
                            sizes="800px"
                        />

                    </div>
                </div>
                <div className="flex justify-between bg-(--bg-primary) items-center min-w-0 ">
                    <button
                        disabled = {isAnalyzing}
                        onClick={() => setSideSelect("summary")}
                        className={`flex items-center) justify-center flex-1 font-medium  mx-5 ${sideSelect === "summary" && "bg-(--bg-tertiary) rounded-md cursor-pointer text-(--accent) shadow-xs transition-all duration-300 shadow-black"}`}>
                        Summary
                    </button>
                    <button
                        disabled = {isAnalyzing}
                        onClick={() => setSideSelect("analysis")}
                        className={`flex items-center) justify-center flex-1 font-medium px-5 mx-5 ${sideSelect === "analysis" && "bg-(--bg-tertiary) text-(--accent) cursor-pointer rounded-md shadow-xs transition-all duration-300 shadow-black"}`}>
                        Analysis
                    </button>

                </div>
                {isAnalyzing ? (
                    <ReviewLoadingSidebar game = {game} completedMoves={completedMoves} totalPlies={history.length} currentFullMove={currentFullMove} totalFullMoves={totalFullMoves} progress={progress} />
                ) : analysisError ? (
                    <div className="flex min-h-0 items-center justify-center px-5 py-6" role="alert">
                        <div className="w-full max-w-sm rounded-xl border border-(--border-default) bg-(--bg-primary) p-6">
                            <p className="font-semibold text-(--text-primary)">Review unavailable</p>
                            <p className="mt-2 text-sm text-(--text-secondary)">{analysisError}</p>
                            <button type="button" onClick={() => window.location.reload()} className="mt-5 inline-flex items-center gap-2 rounded-md bg-(--button-bg) px-3 py-2 text-sm font-semibold text-(--button-text) hover:bg-(--button-hover)">
                                <RotateCcw className="size-4" aria-hidden="true" /> Try again
                            </button>
                        </div>
                    </div>
                ) : sideSelect === "summary" && (
                    <div className="flex flex-col min-h-0 overflow-y-auto px-5 py-4 gap-4">

                        {/* ACCURACY */}
                        <div className="flex flex-col gap-2">
                            <p className="uppercase text-xs tracking-wide text-(--text-secondary) font-medium">
                                Game Accuracy
                            </p>

                            <div className="grid grid-cols-2 gap-3">

                                {/* WHITE */}
                                <div className="flex flex-col gap-2 rounded-md border border-(--border-subtle) bg-(--bg-primary) p-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-(--text-muted)">
                                            {game.white_username}
                                        </span>

                                        <span className="text-xs text-(--text-muted)">
                                            White
                                        </span>
                                    </div>

                                    <p className="text-3xl font-semibold">
                                        {analyzed?.whiteAccuracy}
                                    </p>

                                    <div className="w-full h-1.5 rounded-full bg-(--bg-tertiary) overflow-hidden">
                                        <div className="h-full w-[84.1%] bg-(--accent)" />
                                    </div>
                                </div>

                                {/* BLACK */}
                                <div className="flex flex-col gap-2 rounded-md border border-(--border-subtle) bg-(--bg-primary) p-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-(--text-muted)">
                                            {game.black_username}
                                        </span>

                                        <span className="text-xs text-(--text-muted)">
                                            Black
                                        </span>
                                    </div>

                                    <p className="text-3xl font-semibold">
                                        {analyzed?.blackAccuracy}
                                    </p>

                                    <div className="w-full h-1.5 rounded-full bg-(--bg-tertiary) overflow-hidden">
                                        <div className="h-full w-[79.6%] bg-(--text-secondary)" />
                                    </div>
                                </div>

                            </div>
                        </div>


                        {/* MOVE QUALITY */}
                        <div className="flex flex-col gap-2">
                            <div className="flex flex-col rounded-lg  bg-(--bg-secondary) border border-(--border-subtle) overflow-hidden">
                                <div className="grid grid-cols-[1fr_1.4fr_1fr] items-center px-4 py-3 ">
                                    <span className="text-[11px] font-medium text-(--text-secondary)">
                                        {game.white_username}
                                    </span>

                                    <span className="text-[10px] uppercase tracking-[0.14em] text-center font-semibold text-(--text-muted)">
                                        Move Quality
                                    </span>

                                    <span className="text-[11px] font-medium text-(--text-secondary) text-right">
                                        {game.black_username}
                                    </span>
                                </div>


                                <div className="grid grid-cols-[1fr_1.4fr_1fr] items-center px-4 py-2.5">
                                    <span className="text-sm font-semibold">
                                        --
                                    </span>

                                    <span className="text-[14px] tracking-[0.12em] text-center font-semibold text-(--brilliant)">
                                        Inhumane
                                    </span>

                                    <span className="text-sm font-semibold text-right">
                                        --
                                    </span>
                                </div>


                                <div className="grid grid-cols-[1fr_1.4fr_1fr] items-center px-4 py-2.5">
                                    <span className="text-sm font-semibold">
                                        {analyzed?.whiteClassifications.exceptional}
                                    </span>

                                    <span className="text-[14px] tracking-[0.12em] text-center font-semibold text-(--accent-blue)">
                                        Exceptional
                                    </span>

                                    <span className="text-sm font-semibold text-right">
                                        {analyzed?.blackClassifications.exceptional}

                                    </span>
                                </div>


                                <div className="grid grid-cols-[1fr_1.4fr_1fr] items-center px-4 py-2.5 ">
                                    <span className="text-sm font-semibold">
                                        {analyzed?.whiteClassifications.best}
                                    </span>

                                    <span className="text-[14px] tracking-[0.12em] text-center font-semibold text-(--success)">
                                        Best
                                    </span>

                                    <span className="text-sm font-semibold text-right">
                                        {analyzed?.blackClassifications.best}
                                    </span>
                                </div>

                                <div className="grid grid-cols-[1fr_1.4fr_1fr] items-center px-4 py-2.5">
                                    <span className="text-sm font-semibold">
                                        {analyzed?.whiteClassifications.precise}
                                    </span>

                                    <span className="text-[14px] tracking-[0.12em] text-center font-semibold text-orange-500">
                                        Precise
                                    </span>

                                    <span className="text-sm font-semibold text-right">
                                        {analyzed?.blackClassifications.precise}
                                    </span>
                                </div>

                                <div className="grid grid-cols-[1fr_1.4fr_1fr] items-center px-4 py-2.5">
                                    <span className="text-sm font-semibold">
                                        {analyzed?.whiteClassifications.good}
                                    </span>

                                    <span className="text-[14px] tracking-[0.12em] text-center font-semibold text-(--text-secondary)">
                                        Good
                                    </span>

                                    <span className="text-sm font-semibold text-right">
                                        {analyzed?.blackClassifications.good}
                                    </span>
                                </div>

                                <div className="grid grid-cols-[1fr_1.4fr_1fr] items-center px-4 py-2.5">
                                    <span className="text-sm font-semibold">
                                        {analyzed?.whiteClassifications.confusing}
                                    </span>

                                    <span className="text-[14px] tracking-[0.12em] text-center font-semibold text-(--warning)">
                                        Confusing
                                    </span>

                                    <span className="text-sm font-semibold text-right">
                                        {analyzed?.blackClassifications.confusing}
                                    </span>
                                </div>

                                <div className="grid grid-cols-[1fr_1.4fr_1fr] items-center px-4 py-2.5">
                                    <span className="text-sm font-semibold">
                                        {analyzed?.whiteClassifications.incorrect}
                                    </span>

                                    <span className="text-[14px] tracking-[0.12em] text-center font-semibold text-orange-500">
                                        Incorrect
                                    </span>

                                    <span className="text-sm font-semibold text-right">
                                        {analyzed?.blackClassifications.incorrect}
                                    </span>
                                </div>

                                <div className="grid grid-cols-[1fr_1.4fr_1fr] items-center px-4 py-2.5">
                                    <span className="text-sm font-semibold">
                                        {analyzed?.whiteClassifications.throw}
                                    </span>

                                    <span className="text-[14px] tracking-[0.12em] text-center font-semibold text-(--danger)">
                                        Throw
                                    </span>

                                    <span className="text-sm font-semibold text-right">
                                        {analyzed?.blackClassifications.throw}
                                    </span>
                                </div>

                            </div>
                        </div>
                    </div>
                )}
                {sideSelect === "analysis" && (
                    <div className="relative flex flex-col min-h-0 overflow-hidden">

                        {/* STOCKFISH HEADER */}
                        <div className="flex flex-col px-5 pb-3 ">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="uppercase text-xs tracking-wide text-(--text-secondary) font-medium">
                                        Stockfish 18
                                    </p>

                                    <div className="flex items-end gap-2 mt-1">
                                        <p className="text-3xl font-semibold">
                                            --
                                        </p>
                                        <span className="text-xs text-(--text-muted) pb-1">
                                            depth 18 / 22
                                        </span>
                                    </div>
                                </div>
                            </div>

                        </div>


                        {/* ENGINE LINES */}
                        <div className="flex flex-col px-5 py-3 gap-1.5">
                            <div className="grid grid-cols-[55px_70px_minmax(0,1fr)] text-xs rounded-md px-3 py-2 bg-(--bg-tertiary)">
                                <span className="text-(--accent) font-semibold">
                                    +0.42
                                </span>

                                <span className="font-medium">
                                    Bd3
                                </span>

                                <span className="truncate text-(--text-muted)">
                                    Qe7 Qg4+ Kh8 Qh5
                                </span>
                            </div>

                            <div className="grid grid-cols-[55px_70px_minmax(0,1fr)] text-xs px-3 py-2">
                                <span className="text-(--text-secondary)">
                                    +0.18
                                </span>

                                <span>
                                    Rfe1
                                </span>

                                <span className="truncate text-(--text-muted)">
                                    Qe7 Bd3 Qf8 Qh4
                                </span>
                            </div>

                            <div className="grid grid-cols-[55px_70px_minmax(0,1fr)] text-xs px-3 py-2">
                                <span className="text-(--text-secondary)">
                                    -0.31
                                </span>

                                <span>
                                    Bxc6
                                </span>

                                <span className="truncate text-(--text-muted)">
                                    bxc6 Qxc6 Qd6
                                </span>
                            </div>
                        </div>


                        {/* MOVE HISTORY */}
                        <div className="flex-1 min-h-0">

                            <div className="h-full overflow-y-auto px-5 py-3 pr-12">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="uppercase text-xs text-(--text-muted)">
                                        Move history
                                    </span>

                                    <span className="text-xs text-(--text-muted)">
                                        17 / 34
                                    </span>
                                </div>

                                <div className="grid grid-cols-[35px_1fr_1fr] gap-y-1 text-sm">
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-4 gap-2 px-3">
                    <button
                        disabled={currentMove === 0 || isAnalyzing}
                        onClick={() => setCurrentMove(0)}
                        className="flex items-center justify-center rounded-md bg-(--bg-primary) border border-(--border-subtle)">
                        <StepBack size={14} />
                    </button>

                    <button
                        disabled={currentMove === 0 || isAnalyzing}
                        onClick={() => {
                            setCurrentMove((p) => p - 1)
                            const params = new URLSearchParams(searchParams.toString());
                            const temp = currentMove - 1
                            params.set("move", temp.toString());
                            router.replace(`${pathname}?${params.toString()}`);
                        }}
                        className="flex items-center justify-center rounded-md bg-(--bg-primary) border border-(--border-subtle)">
                        <ChevronLeft size={14} />
                    </button>



                    <button
                        disabled={currentMove === history.length || isAnalyzing}
                        onClick={() => {
                            setCurrentMove((p) => p + 1)
                            const params = new URLSearchParams(searchParams.toString());
                            const temp = currentMove + 1
                            params.set("move", temp.toString());
                            router.replace(`${pathname}?${params.toString()}`);
                        }}
                        className="flex items-center justify-center rounded-md bg-(--bg-primary) border border-(--border-subtle)">
                        <ChevronRight size={14} />
                    </button>

                    <button
                        disabled={currentMove === history.length || isAnalyzing}
                        onClick={() => setCurrentMove(history.length)}
                        className="flex items-center justify-center rounded-md bg-(--bg-primary) border border-(--border-subtle)">
                        <StepForward size={14} />
                    </button>
                </div>
            </div>
        </div>
    )
}
