import {ChessboardOptions, PieceRenderObject} from "react-chessboard"
export function CustomChessBoard(position: string, side: "white" | "black", specificStyles: Record<string, React.CSSProperties>, pieces: PieceRenderObject ) : ChessboardOptions{
    return{
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
        position,
        animationDurationInMs: 200,
        squareStyles: specificStyles,
    }
}