import { ChessGame, GameData, OpeningData } from "../../lib/types";
import { ecoRegexHelper, getGameOutcome, getOpeningKey, getOutcomeScore } from "./helpers";

export type AnalysisReport = {
    username: string,
    openings: OpeningData[],
    games: Record<string, GameData>
}


export async function NormalizationOfGames(games: ChessGame[], username: string) : Promise<AnalysisReport> {
    const openingStats = new Map<string, OpeningData>();
    const gameStats = new Map<string, GameData>();
    for (const game of games) {
        const isWhite = game.white.username.toLowerCase() === username.toLowerCase();
        const playerResult = isWhite ? game.white.result : game.black.result;
        const outcome = getGameOutcome(playerResult);
        const score = getOutcomeScore(outcome);
        const openingKey = getOpeningKey(game.eco ?? "");
        const {family, variation} = ecoRegexHelper(openingKey)
        if(!gameStats.has(game.uuid)){
            const userColor = isWhite ? "white" : "black";
            const result = score === 1 ? "win" : score === 0.5 ? "draw" : "loss";
            const timeClass = game.time_class
            const timeControl = game.time_control;
            const chessComAccuracy = (userColor === "white" ? game.accuracies?.white : game.accuracies?.black) ?? 0;
            gameStats.set(game.uuid, {
                url: game.url,
                pgn: game.pgn,
                userColor,
                result,
                timeClass,
                timeControl,
                chessComAccuracy,
                openingName: family,
                openingVariation: variation,
                ecoUrl: game.eco ?? "Opening Unknown"
            })

        }
        if (!openingStats.has(openingKey)) {
            openingStats.set(openingKey, {
              ecoUrl: game.url,
              wins: 0,
              games: 0,
              draws: 0,
              losses: 0,
              scorePercent: 0,
              gameIds: [],
              openingName: family,
              openingVariation: variation,
              score: 0,
            });
          }
        const opening = openingStats.get(openingKey)!;
        opening.games += 1;
        opening.score += score;
        opening.gameIds.push(game.uuid);

        if (outcome === "win") {
            opening.wins += 1;
        } else if (outcome === "draw") {
            opening.draws += 1;
        } else {
            opening.losses += 1;
        }
        opening.scorePercent = Number(
            ((opening.score / opening.games) * 100).toFixed(2)
        );
    }
    const openings = [...openingStats.values()];
    return {
        username: username,
        openings,
        games: Object.fromEntries(gameStats.entries())
    }
}