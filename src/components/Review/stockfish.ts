import { Move } from "chess.js";

export function createStockfishWorker() {
    const worker = new Worker(
        "/stockfish/stockfish-18-single.js"
    );
    worker.postMessage("uci");
    return worker;
}

export async function EvaluateGame(worker: Worker, history: Move[]) {
    for (const i of history) {
        const result = await analyzePositon(worker, i.before);
    }
}
async function analyzePositon(worker: Worker, fen: string): Promise<string[]> {
    return new Promise((resolve) => {
        const lines: string[] = []
        const handler = (event: MessageEvent) => {
            const line = event.data as string;
            
            lines.push(line);
            if (line.startsWith("info")){
                console.log(parseMultiPv(line))
            }
            if (line.startsWith("bestmove")) {
                worker.removeEventListener("message", handler);
                resolve(lines);
            }
        }
            worker.addEventListener("message", handler);
            worker.postMessage("setoption name MultiPV value 5");
            worker.postMessage(`position fen ${fen}`);
            worker.postMessage("go depth 20");
        
    })
}

type Candidate = {
    rank: number;
    eval: number;
    moves: string[];
};

function parseMultiPv(line: string): Candidate | null {
    const rank = line.match(/multipv (\d+)/);
    const score = line.match(/score cp (-?\d+)/);
    const pv = line.match(/ pv (.+)$/);

    if (!rank || !score || !pv) {
        return null;
    }

    return {
        rank: Number(rank[1]),
        eval: Number(score[1]) / 100,
        moves: pv[1].split(" "),
    };
}