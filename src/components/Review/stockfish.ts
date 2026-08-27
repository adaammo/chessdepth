import { Move } from "chess.js";

export function createStockfishWorker() {
    const worker = new Worker(
        "/stockfish/stockfish-18-single.js"
    );
    worker.postMessage("uci");
    return worker;
}

export async function EvaluateGame(worker: Worker, history: Move[] ){
// map a single move, like a6 to a series of stockfish best moves, [a3,nf6, etc]
const bestMovesMap = new Map<string, string[]>();

}