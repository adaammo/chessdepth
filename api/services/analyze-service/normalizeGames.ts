import { PLAYER_URL, STATS_URL } from "../../lib/constants"
import { ChessGame, GameData, OpeningData, OpeningStats, PlayerPayload } from "../../lib/types";
import { ecoRegexHelper, getGameOutcome, getOpeningKey, getOutcomeScore } from "./helpers";
import { getPlayersProfile } from "./archives";

export type AnalysisReport = {
    username: string,
    openings: OpeningData[],
    games: Record<string, GameData>,
    profile: PlayerPayload
    highestSeen: OpeningStats
    overallWinRate: number
    bestOutcome: OpeningStats
    totalGames: number
}


export async function NormalizationOfGames(games: ChessGame[], username: string): Promise<AnalysisReport> {
    const openingStats = new Map<string, OpeningData>();
    const gameStats = new Map<string, GameData>();
    const profileQuery = await getPlayersProfile(PLAYER_URL(username), STATS_URL(username));
    let mostSeenOpeningCount = 0;
    let mostSeenOpeningName = "";
    let bestOutcomeOpening = "";
    let bestOutcomeWinRate = 0;
    let winRate = 0;
    if (!profileQuery) {
        throw new Error("PLAYER_PROFILE_NOT_FOUND");
    }
    const profile: PlayerPayload = { username: profileQuery.username, avatar: profileQuery.avatar, stats: profileQuery.stats };
    let totalGames = 0;
    for (const game of games) {
        const isWhite = game.white.username.toLowerCase() === username.toLowerCase();
        const userColor = isWhite ? "white" : "black";
        const playerResult = isWhite ? game.white.result : game.black.result;
        const outcome = getGameOutcome(playerResult);
        const score = getOutcomeScore(outcome);
        const openingKey = getOpeningKey(game.eco ?? "");
        const { family, variation } = ecoRegexHelper(openingKey)
        winRate += score;
        if (!gameStats.has(game.uuid)) {
            const result = score === 1 ? "win" : score === 0.5 ? "draw" : "loss";
            const timeClass = game.time_class
            const timeControl = game.time_control;
            const chessComAccuracy = (userColor === "white" ? game.accuracies?.white : game.accuracies?.black)
            const date = game.start_time ? game.start_time : game.end_time;
            const opponentUsername = isWhite ? game.black.username : game.white.username
            gameStats.set(game.uuid, {
                url: game.url,
                pgn: game.pgn,
                opponentUsername,
                userColor,
                result,
                fen: game.fen,
                timeClass,
                timeControl,
                date,
                chessComAccuracy,
                openingName: family,
                openingVariation: variation,
                ecoUrl: game.eco ?? "Opening Unknown"
            });
        }
        if (!openingStats.has(family)) {
            openingStats.set(family, {
                ecoUrl: game.url,
                white: {
                    whitePercentage: 0,
                    whiteDraws: 0,
                    whiteGames: 0,
                    whiteLosses: 0,
                    whiteScore: 0,
                    whiteWins: 0
                },
                black: {
                    blackPercentage: 0,
                    blackDraws: 0,
                    blackGames: 0,
                    blackLosses: 0,
                    blackScore: 0,
                    blackWins: 0,
                },

                gameIds: [],
                openingName: family,
                openingVariations: new Set<string>()
            });
        }
        totalGames++;
        const opening = openingStats.get(family)!;
        opening.openingVariations.add(variation);
        if (opening.white.whiteGames + opening.black.blackGames > mostSeenOpeningCount) {
            mostSeenOpeningCount = opening.white.whiteGames + opening.black.blackGames;
            mostSeenOpeningName = opening.openingName;
        }
        if (userColor === "white") {
            opening.white.whiteGames += 1;
            opening.white.whiteScore += score;
            if (outcome === "win") {
                opening.white.whiteWins += 1;
            } else if (outcome === "draw") {
                opening.white.whiteDraws += 1;
            } else {
                opening.white.whiteLosses += 1;
            }
            opening.white.whitePercentage = Number(
                ((opening.white.whiteScore / opening.white.whiteGames) * 100).toFixed(2)
            );
        }
        else {
            opening.black.blackGames += 1;
            opening.black.blackScore += score;
            if (outcome === "win") {
                opening.black.blackWins += 1;
            } else if (outcome === "draw") {
                opening.black.blackDraws += 1;
            } else {
                opening.black.blackLosses += 1;
            }
            opening.black.blackPercentage = Number(
                ((opening.black.blackScore / opening.black.blackGames) * 100).toFixed(2)
            );
        }
        opening.gameIds.push(game.uuid);
    }

    const openings = [...openingStats.values()];
    
    for (const opening of Object.values(openings)) {
        const totalGames =
            opening.white.whiteGames +
            opening.black.blackGames;
    
        if (totalGames < 10) {
            continue;
        }
    
        const totalScore =
            opening.white.whiteScore +
            opening.black.blackScore;
    
        const scorePercentage = totalScore / totalGames;
    
        if (scorePercentage > bestOutcomeWinRate) {
            bestOutcomeWinRate = scorePercentage;
            bestOutcomeOpening = opening.openingName;
        }
    }
    return {
        username: username,
        openings,
        games: Object.fromEntries(gameStats.entries()),
        profile,
        highestSeen: {
            openingName: mostSeenOpeningName,
            count: mostSeenOpeningCount
        },
        overallWinRate: (winRate / totalGames),
        bestOutcome: {
            openingName: bestOutcomeOpening,
            count: bestOutcomeWinRate
        },
        totalGames
    }
}

