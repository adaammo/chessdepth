"use client"
import { GamesDatabase } from "@/api/lib/types";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Chessboard, ChessboardOptions, type PieceRenderObject } from "react-chessboard"
import { Chess, Move } from "chess.js"
import { ChevronLeft, ChevronRight, Play, StepBack, StepForward } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createStockfishWorker, EvaluateGame } from "./stockfish";
const DEFAULT_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
export default function Review({ game, perspective, pfp_url, move }: { game: GamesDatabase, perspective: string, pfp_url: string, move: number }) {
    const chess = new Chess();
    chess.loadPgn(game.pgn);
    const history = chess.history({ verbose: true })
    const [currentMove, setCurrentMove] = useState<number>(move);
    const fen = currentMove === 0 ? DEFAULT_FEN : history[currentMove - 1].after
    const specificStyles = currentMove === 0 ? {} : {
        [history[currentMove - 1].from]: { backgroundColor: "var(--accent-deep)", borderColor: "var(--accent-deep)" },
        [history[currentMove - 1].to]: { backgroundColor: "#dccfb1", borderColor: "var(--accent-deep)" },
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
        const worker = createStockfishWorker();
        EvaluateGame(worker, history)
        return () => {
            worker.terminate();
        };
    }, []);

    const [side, setSide] = useState<"black" | "white">(game.black_username === perspective ? "black" : "white")
    const [sideSelect, setSideSelect] = useState<"analysis" | "summary">("analysis")
    const [whiteAdvantage, setWhiteAdvantage] = useState<number>(0.00)
    const [blackAdvantage, setBlackAdvantage] = useState<number>(0.00)
    const router = useRouter()
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const pieceTypes = [
        "wP", "wN", "wB", "wR", "wQ", "wK",
        "bP", "bN", "bB", "bR", "bQ", "bK",
    ];

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
    const chessBoardOptions: ChessboardOptions = {
        lightSquareNotationStyle: {
            color: "white",
            font: "status-bar",
        },
        darkSquareNotationStyle: {
            color: "white",
            font: "status-bar",
        },
        darkSquareStyle: {
            background: `
                linear-gradient(
                    145deg,
                    #3f3f42 0%,
                    #2c2c2e 100%
                )
            `,
        },

        lightSquareStyle: {
            background: "#bababd"
        },
        alphaNotationStyle: {
            fontSize: "20px",
        },
        numericNotationStyle: {
            fontSize: "20px",
        },
        boardStyle: {
            borderRadius: "5px"
        },
        boardOrientation: side,
        pieces,
        position: fen,
        animationDurationInMs: 200,
        squareStyles: specificStyles,
    }

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
                        onClick={() => setSideSelect("analysis")}
                        className={`flex items-center) justify-center flex-1 font-medium px-5 mx-5 ${sideSelect === "analysis" && "bg-(--bg-tertiary) text-(--accent) cursor-pointer rounded-md shadow-xs transition-all duration-300 shadow-black"}`}>
                        Analysis
                    </button>
                    <button
                        onClick={() => setSideSelect("summary")}
                        className={`flex items-center) justify-center flex-1 font-medium  mx-5 ${sideSelect === "summary" && "bg-(--bg-tertiary) rounded-md cursor-pointer text-(--accent) shadow-xs transition-all duration-300 shadow-black"}`}>
                        Summary
                    </button>
                </div>
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
                            <div className="w-full rounded-full h-3"
                            style = {{
                                backgroundColor: `linear-gradiant(to right, white ${whiteAdvantage}% black ${blackAdvantage}%`
                            }} />
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
                {sideSelect === "summary" && (
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
                                        --
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
                                        --
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
                                        1
                                    </span>

                                    <span className="text-[14px] tracking-[0.12em] text-center font-semibold text-(--brilliant)">
                                        Inhumane
                                    </span>

                                    <span className="text-sm font-semibold text-right">
                                        0
                                    </span>
                                </div>


                                <div className="grid grid-cols-[1fr_1.4fr_1fr] items-center px-4 py-2.5">
                                    <span className="text-sm font-semibold">
                                        3
                                    </span>

                                    <span className="text-[14px] tracking-[0.12em] text-center font-semibold text-(--accent-blue)">
                                        Exceptional
                                    </span>

                                    <span className="text-sm font-semibold text-right">
                                        2
                                    </span>
                                </div>


                                <div className="grid grid-cols-[1fr_1.4fr_1fr] items-center px-4 py-2.5 ">
                                    <span className="text-sm font-semibold">
                                        9
                                    </span>

                                    <span className="text-[14px] tracking-[0.12em] text-center font-semibold text-(--success)">
                                        Best
                                    </span>

                                    <span className="text-sm font-semibold text-right">
                                        8
                                    </span>
                                </div>


                                <div className="grid grid-cols-[1fr_1.4fr_1fr] items-center px-4 py-2.5">
                                    <span className="text-sm font-semibold">
                                        11
                                    </span>

                                    <span className="text-[14px] tracking-[0.12em] text-center font-semibold text-(--text-secondary)">
                                        Good
                                    </span>

                                    <span className="text-sm font-semibold text-right">
                                        12
                                    </span>
                                </div>

                                <div className="grid grid-cols-[1fr_1.4fr_1fr] items-center px-4 py-2.5">
                                    <span className="text-sm font-semibold">
                                        1
                                    </span>

                                    <span className="text-[14px] tracking-[0.12em] text-center font-semibold text-(--accent)">
                                        Theory
                                    </span>

                                    <span className="text-sm font-semibold text-right">
                                        2
                                    </span>
                                </div>

                                <div className="grid grid-cols-[1fr_1.4fr_1fr] items-center px-4 py-2.5">
                                    <span className="text-sm font-semibold">
                                        2
                                    </span>

                                    <span className="text-[14px] tracking-[0.12em] text-center font-semibold text-(--warning)">
                                        Confusing
                                    </span>

                                    <span className="text-sm font-semibold text-right">
                                        3
                                    </span>
                                </div>


                                <div className="grid grid-cols-[1fr_1.4fr_1fr] items-center px-4 py-2.5">
                                    <span className="text-sm font-semibold">
                                        1
                                    </span>

                                    <span className="text-[14px] tracking-[0.12em] text-center font-semibold text-orange-500">
                                        Incorrect
                                    </span>

                                    <span className="text-sm font-semibold text-right">
                                        2
                                    </span>
                                </div>


                                <div className="grid grid-cols-[1fr_1.4fr_1fr] items-center px-4 py-2.5">
                                    <span className="text-sm font-semibold">
                                        0
                                    </span>

                                    <span className="text-[14px] tracking-[0.12em] text-center font-semibold text-(--danger)">
                                        Throw
                                    </span>

                                    <span className="text-sm font-semibold text-right">
                                        1
                                    </span>
                                </div>

                            </div>
                        </div>
                    </div>
                )}
                <div className="grid grid-cols-4 gap-2 px-3">
                    <button
                        disabled={currentMove === 0}
                        onClick={() => setCurrentMove(0)}
                        className="flex items-center justify-center rounded-md bg-(--bg-primary) border border-(--border-subtle)">
                        <StepBack size={14} />
                    </button>

                    <button
                        disabled={currentMove === 0}
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
                        disabled={currentMove === history.length}
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
                        disabled={currentMove === history.length}
                        onClick={() => setCurrentMove(history.length)}
                        className="flex items-center justify-center rounded-md bg-(--bg-primary) border border-(--border-subtle)">
                        <StepForward size={14} />
                    </button>
                </div>
            </div>
        </div>
    )
}
