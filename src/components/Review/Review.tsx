"use client"
import { Chessboard, ChessboardOptions, type PieceRenderObject } from "react-chessboard"
export default function Review() {
    const pieceTypes = [
        "wP", "wN", "wB", "wR", "wQ", "wK",
        "bP", "bN", "bB", "bR", "bQ", "bK",
    ] as const;

    const pieces = pieceTypes.map((p) => {

    })
    const chessBoardOptions: ChessboardOptions = {
        lightSquareNotationStyle: {
            color: "white"
        },
        darkSquareNotationStyle: {
            color: "white"
        },
        darkSquareStyle: {
            backgroundColor: "#505552"
        },
        lightSquareStyle: {
            backgroundColor: "#A7AAA7"
        },
    }
    return (
        <div className="grid grid-cols-[20px_1.5fr_1fr] gap-2 max-w-screen  w-screen">
            <div className="w-full bg-white rounded-full h-full" />
            <Chessboard
                
                options={chessBoardOptions} />
            <span>
                Hi
            </span>
        </div>
    )
}