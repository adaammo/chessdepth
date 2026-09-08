import { Chess, Move } from "chess.js";

export function createStockfishWorker() {
    const worker = new Worker(
        "/stockfish/stockfish-18-single.js"
    );
    worker.postMessage("uci");
    worker.postMessage("setoption name MultiPV value 3");
    return worker;
}
const PIECE_VALUE = {
    p: 100,
    n: 300,
    b: 300,
    r: 500,
    q: 900,
    k: 0
};
type MoveJustifications = "exceptional" | "best" | "good" | "confusing" | "incorrect" | "throw" | null
export async function EvaluateGame(worker: Worker, history: Move[]) {
    const whiteAccuracies = []
    const blackAccuracies = [];
    let whiteInhumaneMoves = 0;
    let blackInhumaneMoves = 0;

    let whiteExceptionalMoves = 0;
    let blackExceptionalMoves = 0;

    let whiteBestMoves = 0;
    let blackBestMoves = 0;

    let whiteGoodMoves = 0;
    let blackGoodMoves = 0;

    let whiteConfusingMoves = 0;
    let blackConfusingMoves = 0;

    let whiteIncorrectMoves = 0;
    let blackIncorrectMoves = 0;

    let whiteThrowMoves = 0;
    let blackThrowMoves = 0;

    if (history.length === 0) {
        return;
    }

    let beforeAnalysis = await analyzePosition(
        worker,
        history[0].before
    );
    for (const i of history) {
        const afterAnalysis = await analyzePosition(worker, i.after);
        if (afterAnalysis.gameEnded) {
            const accuracy = 100;
            if (i.color === "w") {
                whiteAccuracies.push(accuracy);
            }
            else {
                blackAccuracies.push(accuracy);
            }
            break;
        }
        const beforeScore = beforeAnalysis.topMoves[0].score
        const afterScore = afterAnalysis.topMoves[0].score

        const moveAnalysis = calculateMove(beforeScore, afterScore);

        if (moveAnalysis === "cp->cp") {
            const beforeCenti = normalizeEval(
                beforeAnalysis.topMoves[0].score.value,
                i.before
            );
            const afterCenti = normalizeEval(
                afterAnalysis.topMoves[0].score.value,
                i.after
            );
            let centipawnLoss: number;

            if (i.color === "w") {
                centipawnLoss = Math.max(
                    0,
                    beforeCenti - afterCenti
                );
            } else {
                centipawnLoss = Math.max(
                    0,
                    afterCenti - beforeCenti
                );
            }

            const accuracy =
                moveAccuracy(centipawnLoss);
            const playedMove = `${i.from}${i.to}${i.promotion ?? ""}`;
            const playedBestMove =
                playedMove === beforeAnalysis.bestMove;

            const best = beforeAnalysis.topMoves[0];
            const second = beforeAnalysis.topMoves[1];
            let isExceptional = false;
            if (!best || !second) {
                const moveJustification =
                    resolveMoveJustification(centipawnLoss);

                switch (moveJustification) {
                    case "best": {
                        if (i.color === "w") {
                            whiteBestMoves += 1;
                        } else {
                            blackBestMoves += 1;
                        }
                        break;
                    }

                    case "good": {
                        if (i.color === "w") {
                            whiteGoodMoves += 1;
                        } else {
                            blackGoodMoves += 1;
                        }
                        break;
                    }

                    case "confusing": {
                        if (i.color === "w") {
                            whiteConfusingMoves += 1;
                        } else {
                            blackConfusingMoves += 1;
                        }
                        break;
                    }

                    case "incorrect": {
                        if (i.color === "w") {
                            whiteIncorrectMoves += 1;
                        } else {
                            blackIncorrectMoves += 1;
                        }
                        break;
                    }

                    case "throw": {
                        if (i.color === "w") {
                            whiteThrowMoves += 1;
                        } else {
                            blackThrowMoves += 1;
                        }
                        break;
                    }
                }
            }
            else {
                if (playedBestMove && (best.score.type === "cp" || second.score.type === "cp")) {
                    const gap =
                        best.score.value - second.score.value;

                    if (gap >= 100) {
                        isExceptional = true;
                    }
                }
            }
            if (isExceptional) {
                if (i.color === "w") {
                    whiteExceptionalMoves += 1
                }
                else {
                    blackExceptionalMoves += 1
                }
            }
            else {
                const moveJustification =
                    resolveMoveJustification(centipawnLoss);

                switch (moveJustification) {
                    case "best": {
                        if (i.color === "w") {
                            whiteBestMoves += 1;
                        } else {
                            blackBestMoves += 1;
                        }
                        break;
                    }

                    case "good": {
                        if (i.color === "w") {
                            whiteGoodMoves += 1;
                        } else {
                            blackGoodMoves += 1;
                        }
                        break;
                    }

                    case "confusing": {
                        if (i.color === "w") {
                            whiteConfusingMoves += 1;
                        } else {
                            blackConfusingMoves += 1;
                        }
                        break;
                    }

                    case "incorrect": {
                        if (i.color === "w") {
                            whiteIncorrectMoves += 1;
                        } else {
                            blackIncorrectMoves += 1;
                        }
                        break;
                    }

                    case "throw": {
                        if (i.color === "w") {
                            whiteThrowMoves += 1;
                        } else {
                            blackThrowMoves += 1;
                        }
                        break;
                    }
                }
            }
            if (i.color === "w") {
                whiteAccuracies.push(accuracy);
            }
            else {
                blackAccuracies.push(accuracy);
            }
        }
        else if (moveAnalysis === "cp->mate") {
            if (afterScore.type === "mate") {
                const whoGotMate = afterScore.winner;

                const accuracy =
                    whoGotMate === i.color
                        ? 100
                        : 0;
                // for ref, if the user moved and let mate occur, its a bludner, else if the user found a move that leads to mate its a exceptional move
                // which = great in chess.com
                if (i.color === whoGotMate) {
                    // moveJustification = exceptional
                    if (i.color === "w") {
                        whiteExceptionalMoves += 1
                    }
                    else {
                        blackExceptionalMoves += 1
                    }
                }
                // moveJustification = throw
                else {
                    if (i.color === "w") {
                        whiteThrowMoves += 1
                    }
                    else {
                        blackThrowMoves += 1
                    }
                }
                if (i.color === "w") {
                    whiteAccuracies.push(accuracy);
                }
                else {
                    blackAccuracies.push(accuracy);
                }
            }
        }

        else if (moveAnalysis === "mate->cp") {
            if (beforeScore.type === "mate" && afterScore.type === "cp") {
                const whoHadMate = beforeScore.winner;

                const afterCenti = normalizeEval(
                    afterScore.value,
                    i.after
                );
                const moverEval = i.color === "w" ? afterCenti : -afterCenti;
                const moveJustification: MoveJustifications = resolveMoveJustification(moverEval);
                switch (moveJustification) {
                    case "best": {
                        if (i.color === "w") {
                            whiteBestMoves += 1;
                        } else {
                            blackBestMoves += 1;
                        }
                        break;
                    }

                    case "good": {
                        if (i.color === "w") {
                            whiteGoodMoves += 1;
                        } else {
                            blackGoodMoves += 1;
                        }
                        break;
                    }

                    case "confusing": {
                        if (i.color === "w") {
                            whiteConfusingMoves += 1;
                        } else {
                            blackConfusingMoves += 1;
                        }
                        break;
                    }

                    case "incorrect": {
                        if (i.color === "w") {
                            whiteIncorrectMoves += 1;
                        } else {
                            blackIncorrectMoves += 1;
                        }
                        break;
                    }

                    case "throw": {
                        if (i.color === "w") {
                            whiteThrowMoves += 1;
                        } else {
                            blackThrowMoves += 1;
                        }
                        break;
                    }
                }
                // you need to just simplify it to how is the current position and who is in the advantgae now
                // if the cenipawn difference is catastrophic, then 0% for this, else the other comparisons
                if (whoHadMate === i.color) {
                    const accuracy = lostMateAccuracy(moverEval);
                    if (i.color === "w") {
                        whiteAccuracies.push(accuracy);
                    }
                    else {
                        blackAccuracies.push(accuracy);
                    }
                }
            }
        }

        else if (moveAnalysis === "mate->mate") {
            if (
                beforeScore.type === "mate" &&
                afterScore.type === "mate"
            ) {
                const beforeWinner = beforeScore.winner;
                const afterWinner = afterScore.winner;
                console.log(beforeWinner, afterWinner, beforeScore, afterScore);
                let accuracy: number;

                if (beforeWinner !== afterWinner) {
                    accuracy = 0;
                }
                else if (beforeWinner === i.color) {
                    accuracy = 100;
                }
                else {
                    const beforeMate = Math.abs(beforeScore.value);
                    const afterMate = Math.abs(afterScore.value);
                    accuracy = mateDefenseAccuracy(Math.max(0, beforeMate - afterMate))
                }
                if (i.color === "w") {
                    whiteExceptionalMoves += 1
                }
                else {
                    blackExceptionalMoves += 1
                }
                if (i.color === "w" && beforeWinner == afterWinner) {
                    whiteAccuracies.push(accuracy);
                } else if (i.color === "b" && beforeWinner == afterWinner) {
                    blackAccuracies.push(accuracy);
                }
            }
        }

        beforeAnalysis = afterAnalysis;
    }
    const whiteAccuracy = gameAccuracy(whiteAccuracies)
    const blackAccuracy = gameAccuracy(blackAccuracies)
    console.log({
        whiteAccuracy,
        blackAccuracy,
        white: {
            exceptional: whiteExceptionalMoves,
            best: whiteBestMoves,
            good: whiteGoodMoves,
            confusing: whiteConfusingMoves,
            incorrect: whiteIncorrectMoves,
            throw: whiteThrowMoves,
        },
        black: {
            exceptional: blackExceptionalMoves,
            best: blackBestMoves,
            good: blackGoodMoves,
            confusing: blackConfusingMoves,
            incorrect: blackIncorrectMoves,
            throw: blackThrowMoves,
        }
    });
}
// Meant to help know if w/b played a decent move between M6->M5 or M6->M1 ended the game instantly
function mateDefenseAccuracy(distanceLost: number) {
    return 100 * Math.exp(-distanceLost / 4);
}
function moveAccuracy(centipawn: number) {
    return 100 * Math.exp(-centipawn / 400);
}
type EngineScore =
    | {
        type: "cp";
        value: number;
    }
    | {
        type: "mate";
        winner: "w" | "b";
        value: number
    };

function calculateMove(before: EngineScore, after: EngineScore):
    "cp->cp" | "cp->mate" | "mate->cp" | "mate->mate" {
    // cp -> cp
    if (
        before.type === "cp" &&
        after.type === "cp"
    ) {
        return "cp->cp";
    }

    if (
        before.type === "cp" &&
        after.type === "mate"
    ) {
        return "cp->mate";
    }

    if (
        before.type === "mate" &&
        after.type === "cp"
    ) {
        return "mate->cp";
    }

    return "mate->mate";
}

type Candidate = {
    rank: number;
    score: EngineScore
    moves: string[];
};
type PositionAnalysis = {
    bestMove: string;
    topMoves: Candidate[];
    gameEnded: boolean
};


function analyzePosition(worker: Worker, fen: string): Promise<PositionAnalysis> {
    return new Promise((resolve) => {
        const topMoves = new Map<number, Candidate>();
        const handler = (event: MessageEvent) => {
            const line = event.data as string;
            if (line.startsWith("info")) {
                const topMove = parseMultiPv(line, fen);
                if (topMove) {
                    topMoves.set(topMove.rank, topMove)
                }
            }
            if (line.startsWith("bestmove")) {
                worker.removeEventListener("message", handler);
                const bestMove = line.split(" ")[1]
                resolve({ bestMove, topMoves: [...topMoves.values()].sort((a, b) => a.rank - b.rank), gameEnded: bestMove === "(none)" ? true : false });
            }
        }
        worker.addEventListener("message", handler);
        worker.postMessage(`position fen ${fen}`);
        worker.postMessage("go depth 12");

    })
}

function parseMultiPv(line: string, fen: string): Candidate | null {
    const rank = line.match(/multipv (\d+)/);
    const cp = line.match(/score cp (-?\d+)/);
    const mate = line.match(/score mate (-?\d+)/);
    const pv = line.match(/ pv (.+)$/);
    if (!rank || !pv || (!cp && !mate)) {
        return null;
    }
    return {
        rank: Number(rank[1]),
        score: cp
            ? {
                type: "cp",
                value: Number(cp[1]),
            }
            : {
                type: "mate",
                value: Number(mate![1]),
                winner: getMateWinner(Number(mate![1]), fen)
            },
        moves: pv[1].split(" "),
    };
}
function getMateWinner(mateValue: number, fen: string): "w" | "b" {
    const sideToMove =
        fen.split(" ")[1] as "w" | "b";
    if (mateValue > 0) {
        return sideToMove;
    }
    return sideToMove === "w"
        ? "b"
        : "w";
}
function normalizeEval(evalCp: number, fen: string): number {
    const sideToMove = fen.split(" ")[1];
    return sideToMove === "w"
        ? evalCp
        : -evalCp;
}

function lostMateAccuracy(moverEval: number): number {
    if (moverEval <= -200) return 0;
    if (moverEval <= 0) return 5;
    if (moverEval <= 200) return 15;
    if (moverEval <= 500) return 30;
    if (moverEval <= 900) return 45;
    if (moverEval <= 1500) return 60;
    return 70;
}

function gameAccuracy(accuracies: number[]): number {
    const average = accuracies.reduce((a, b) => a + b, 0) / accuracies.length;

    const terribleMoves = accuracies.filter(a => a < 30).length;

    const badMoves = accuracies.filter(a => a >= 30 && a < 60).length;

    const penalty =
        terribleMoves * 5 +
        badMoves * 2;

    return Number(Math.max(0, average - penalty).toFixed(2));
}

function resolveMoveJustification(
    centipawnLoss: number
):  | "best"| "good" | "confusing" | "incorrect"| "throw"| null
{

    if (centipawnLoss <= 10) {
        return "best";
    }

    if (centipawnLoss <= 40) {
        return "good";
    }

    // normal move, no summary badge
    if (centipawnLoss <= 80) {
        return null;
    }

    if (centipawnLoss <= 175) {
        return "confusing";
    }

    if (centipawnLoss <= 300) {
        return "incorrect";
    }

    return "throw";
}