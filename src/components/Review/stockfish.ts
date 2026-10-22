import {  Move } from "chess.js";
import { SetStateAction } from "react";
/**
 * 
 * @file The entire stockfish evaluation algorithm
 * As of Oct 22, I, adam, was able to get the engine evlaution for a users accuracy to an error rate for about 0-10%, with most tests lying
 * between 4%-10%
 */
export function createStockfishWorker() {
    const worker = new Worker(
        "/stockfish/stockfish-19-single.js"
    );
    worker.postMessage("uci");
    worker.postMessage("setoption name MultiPV value 2");
    return worker;
}

type MoveJustifications = "exceptional" | "best" | "precise" | "good" | "confusing" | "incorrect" | "throw" | null

type EvaluateGameProps = {
    worker: Worker,
    history: Move[],
    setLoadingAnim: React.Dispatch<SetStateAction<string>>,
    onMoveChange: React.Dispatch<SetStateAction<{ fen: string, moveIndex: number} | null>>;
}
export async function EvaluateGame({ worker, history, setLoadingAnim, onMoveChange}: EvaluateGameProps) {
    const whiteAccuracies = []
    const blackAccuracies = [];
    let whiteInhumaneMoves = 0;
    let blackInhumaneMoves = 0;

    let whiteExceptionalMoves = 0;
    let blackExceptionalMoves = 0;

    let whiteBestMoves = 0;
    let blackBestMoves = 0;

    let whitePreciceMoves = 0;
    let blackPreciceMoves = 0;


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
    for (const [index, move] of history.entries()) {
        setLoadingAnim(move.after)
        const afterAnalysis = await analyzePosition(worker, move.after);
        if (afterAnalysis.gameEnded) {
            const accuracy = 100;
            if (move.color === "w") {
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
                move.before
            );
            const afterCenti = normalizeEval(
                afterAnalysis.topMoves[0].score.value,
                move.after
            );
            let centipawnLoss: number;

            if (move.color === "w") {
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
            const playedMove = `${move.from}${move.to}${move.promotion ?? ""}`;
            const playedBestMove =
                playedMove === beforeAnalysis.bestMove;
            // mini helper inside no need to seperate
            function outcome(cp: number) {
                if (cp >= 200) return "winning";
                if (cp <= -200) return "losing";
                return "equal";
            }
            
            const best = beforeAnalysis.topMoves[0];
            const second = beforeAnalysis.topMoves[1];
            let isExceptional = false;
            
            if (playedBestMove &&
                best?.score.type === "cp" &&
                second?.score.type === "cp") {
                const gap = best.score.value - second.score.value;
                
                const changesOutcome = outcome(best.score.value) !== outcome(second.score.value);
                
                // This is to make sure a user isn't already in a completley dominant situation
                const notAlreadyCompletelyWinning =
                    best.score.value < 700;
                
                    // Now a exceptions = great (chess.com) is >= 2 1/2 pawns, isnt the same as the second score, and isnt dominant
                isExceptional =
                    gap >= 250 &&
                    changesOutcome &&
                    notAlreadyCompletelyWinning;
            }
            else {
                if (playedBestMove && (best?.score.type === "cp" && second && second.score.type === "cp")) {
                    const gap =
                        best.score.value - second.score.value;
                    if (gap >= 350) {
                        isExceptional = true;
                    }
                }
            }
            if (isExceptional) {
                if (move.color === "w") {
                    whiteExceptionalMoves += 1
                }
                else {
                    blackExceptionalMoves += 1
                }
            }
            else {
                const moveJustification =
                    resolveMoveJustification(centipawnLoss, playedBestMove);

                switch (moveJustification) {
                    case "best": {
                        if (move.color === "w") {
                            whiteBestMoves += 1;
                        } else {
                            blackBestMoves += 1;
                        }
                        break;
                    }

                    case "precise": {
                        if (move.color === "w") {
                            whitePreciceMoves += 1;
                        } else {
                            blackPreciceMoves += 1;
                        }
                        break;
                    }

                    case "good": {
                        if (move.color === "w") {
                            whiteGoodMoves += 1;
                        } else {
                            blackGoodMoves += 1;
                        }
                        break;
                    }

                    case "confusing": {
                        if (move.color === "w") {
                            whiteConfusingMoves += 1;
                        } else {
                            blackConfusingMoves += 1;
                        }
                        break;
                    }

                    case "incorrect": {
                        if (move.color === "w") {
                            whiteIncorrectMoves += 1;
                        } else {
                            blackIncorrectMoves += 1;
                        }
                        break;
                    }

                    case "throw": {
                        if (move.color === "w") {
                            whiteThrowMoves += 1;
                        } else {
                            blackThrowMoves += 1;
                        }
                        break;
                    }
                }
            }
            if (move.color === "w") {
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
                    whoGotMate === move.color
                        ? 100
                        : 0;
                // for ref, if the user moved and let mate occur, its a bludner, else if the user found a move that leads to mate its a exceptional move
                // which = great in chess.com
                if (move.color === whoGotMate) {
                    // moveJustification = exceptional
                    if (move.color === "w") {
                        whiteExceptionalMoves += 1
                    }
                    else {
                        blackExceptionalMoves += 1
                    }
                }
                // moveJustification = throw
                else {
                    if (move.color === "w") {
                        whiteThrowMoves += 1
                    }
                    else {
                        blackThrowMoves += 1
                    }
                }
                if (move.color === "w") {
                    whiteAccuracies.push(accuracy);
                }
                else {
                    blackAccuracies.push(accuracy);
                }
            }
        }

        else if (moveAnalysis === "mate->cp") {
            // THIS IS LOGICAL. A mate->cp only works if one side misses the mate. The idea is if they blundered so bad the game swaps it needs
            // To know that.
            if (beforeScore.type === "mate" && afterScore.type === "cp") {
                const whoHadMate = beforeScore.winner;

                const afterCenti = normalizeEval(
                    afterScore.value,
                    move.after
                );
                const moverEval =
                    move.color === "w"
                        ? afterCenti
                        : -afterCenti;
                if (whoHadMate === move.color) {
                    // The mover lost their own mating sequence.
                    const moveJustification =
                        resolveLostMateJustification(moverEval);

                    // Record classification and accuracy here.
                    switch (moveJustification) {
                        case "best": {
                            if (move.color === "w") {
                                whiteBestMoves += 1;
                            } else {
                                blackBestMoves += 1;
                            }
                            break;
                        }
                        case "good": {
                            if (move.color === "w") {
                                whiteGoodMoves += 1;
                            } else {
                                blackGoodMoves += 1;
                            }
                            break;
                        }

                        case "confusing": {
                            if (move.color === "w") {
                                whiteConfusingMoves += 1;
                            } else {
                                blackConfusingMoves += 1;
                            }
                            break;
                        }

                        case "incorrect": {
                            if (move.color === "w") {
                                whiteIncorrectMoves += 1;
                            } else {
                                blackIncorrectMoves += 1;
                            }
                            break;
                        }

                        case "throw": {
                            if (move.color === "w") {
                                whiteThrowMoves += 1;
                            } else {
                                blackThrowMoves += 1;
                            }
                            break;
                        }
                    }
                    const accuracy = lostMateAccuracy(moverEval);
                    if (move.color === "w") {
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
                let accuracy: number;

                if (beforeWinner !== afterWinner) {
                    accuracy = 0;
                }
                else if (beforeWinner === move.color) {
                    accuracy = 100;
                }
                else {
                    const beforeMate = Math.abs(beforeScore.value);
                    const afterMate = Math.abs(afterScore.value);
                    accuracy = mateDefenseAccuracy(Math.max(0, beforeMate - afterMate))
                }
                if (move.color === "w") {
                    whiteExceptionalMoves += 1
                }
                else {
                    blackExceptionalMoves += 1
                }
                if (move.color === "w" && beforeWinner == afterWinner) {
                    whiteAccuracies.push(accuracy);
                } else if (move.color === "b" && beforeWinner == afterWinner) {
                    blackAccuracies.push(accuracy);
                }
            }
        }

        beforeAnalysis = afterAnalysis;
        onMoveChange({
            fen: move.after,
            moveIndex: index + 1,
        });
    }
    const whiteAccuracy = gameAccuracy(whiteAccuracies)
    const blackAccuracy = gameAccuracy(blackAccuracies)
    console.log({
        whiteAccuracy,
        blackAccuracy,
        white: {
            exceptional: whiteExceptionalMoves,
            precise: whitePreciceMoves,
            best: whiteBestMoves,
            good: whiteGoodMoves,
            confusing: whiteConfusingMoves,
            incorrect: whiteIncorrectMoves,
            throw: whiteThrowMoves,
        },
        black: {
            exceptional: blackExceptionalMoves,
            precise: blackPreciceMoves,
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
        worker.postMessage("go depth 20 movetime 300");

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

    const badMoves = accuracies.filter(a => a >= 30 && a < 65).length;

    const penalty =
        terribleMoves +
        badMoves * 2;

    return Number(Math.max(0, average - penalty).toFixed(2));
}

function resolveLostMateJustification(
    moverEval: number
): MoveJustifications {
    if (moverEval <= 0) {
        return "throw";
    }

    if (moverEval <= 500) {
        return "incorrect";
    }

    if (moverEval <= 900) {
        return "confusing";
    }

    if (moverEval <= 1500) {
        return null;
    }

    return "good";
}
function resolveMoveJustification(
    centipawnLoss: number,
    playedBestMove: boolean
): | "best" | "precise" | "good" | "confusing" | "incorrect" | "throw" | null {
    if (playedBestMove) {
        return "best";
    }
    if (centipawnLoss <= 25) {
        return "precise";
    }

    if (centipawnLoss <= 60) {
        return "good";
    }

    if (centipawnLoss <= 140) {
        return "confusing";
    }

    if (centipawnLoss <= 285) {
        return "incorrect";
    }

    return "throw";
}