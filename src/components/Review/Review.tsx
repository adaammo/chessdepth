"use client"
import Image from "next/image";
import { Chessboard, ChessboardOptions, type PieceRenderObject } from "react-chessboard"
export default function Review() {
    const pieceTypes = [
        "wP", "wN", "wB", "wR", "wQ", "wK",
        "bP", "bN", "bB", "bR", "bQ", "bK",
    ] as const;

    const pieces = Object.fromEntries(pieceTypes.map((p) => [
        p,
        () => (
            <Image
                width={100}
                height={100}
                alt={p}
                src={`/maestro-chess-pieces/${p}.svg`}
                className="h-full w-full object-contain"
                draggable={false}
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
                radial-gradient(
                    circle at 25% 20%,
                    rgba(255, 255, 255, 0.07),
                    transparent 52%
                ),
                linear-gradient(
                    145deg,
                    #353537 0%,
                    #29292b 100%
                )
            `,
        },

        lightSquareStyle: {
            background: `
                radial-gradient(
                    circle at 25% 20%,
                    rgba(255, 255, 255, 0.12),
                    transparent 52%
                ),
                linear-gradient(
                    145deg,
                    #77787c 0%,
                    #5e5f63 100%
                )
            `,
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
        pieces,
    }
    return (
        <div className="grid grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] items-start min-w-0 w-full px-5 py-3 max-w-full overflow-hidden gap-4">
            <div className="flex flex-col gap-2 items-center justify-center">
                <section className="flex w-full justify-between items-center">
                    <div className="rounded-md border border-(--border-subtle) bg-white/95 text-black font-semibold px-2 py-1">
                        White
                    </div>
                    <div className="rounded-md border border-(--border-subtle) bg-black/80 font-semibold p-2">
                        Black
                    </div>
                </section>
                <div className=" grid min-w-0 self-start grid-cols-[8px_minmax(0,1.5fr)] items-stretch gap-2">
                    <div className="w-2 rounded-full bg-white" />
                    <div className="aspect-square w-full min-w-0">
                        <Chessboard options={chessBoardOptions} />
                    </div>
                </div>
            </div>

            <div className="min-w-0 p-3 bg-(--bg-secondary) h-full rounded-md border border-(--accent-muted)">
                Hi
            </div>
        </div>
    )
}