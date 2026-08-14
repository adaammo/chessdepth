import axios, { isAxiosError } from "axios";
import { CHESS_API_HEADERS, CHESS_URL_ARCHIVES } from "../../lib/constants";
import { ChessArchivesResponse, ChessComPlayerResult, ChessComPlayerStats, ChessGame, ChessMonthlyGamesResponse, PlayerProfile } from "../../lib/types";

export async function getPlayerArchives(username: string): Promise<string[]> {
    try {
        const url = CHESS_URL_ARCHIVES(username)
        const response = await axios.get<ChessArchivesResponse>(url, { headers: CHESS_API_HEADERS });
        const { archives } = response.data
        return archives;
    }
    catch (error) {
        if (isAxiosError(error)) {
            const status = error.response?.status;
            if (status === 404) {
                throw new Error("USERNAME_NOT_FOUND");
            }
            throw new Error(`CHESS_API_ERROR:${status ?? 503}`);
        }
        throw error;
    }
}
export async function ArchivesDestructor(archives: string[], username: string) : Promise<ChessGame[]> {
    try {
        const recentArchives = archives.slice(-6);
        recentArchives.reverse();
        if (recentArchives.length === 0) {
            throw new Error("NO_RECENT_GAMES");
        }
        const gameHistory : ChessGame[][] = [];
        for (const link of recentArchives) {
            const response = await axios.get<ChessMonthlyGamesResponse>(link, {headers: CHESS_API_HEADERS});
            if(response.data){
                response.data.games.reverse();
                gameHistory.push(response.data.games)
            }
        }
        return gameHistory.flat();
    }
    catch (error) {
        if(isAxiosError(error)){
            const status = error.response?.status;
            throw new Error(`CHESS_API_ERROR:${status ?? 503}`);
        }
        throw error;
    }
}
export async function getPlayersProfile(profile_url: string, stats_url: string) : Promise<{ ok: true; username: string; avatar: string; stats: ChessComPlayerStats }>{
    try{
        const profile = await axios.get<PlayerProfile>(profile_url, {headers: CHESS_API_HEADERS});
        const stats = await axios.get<ChessComPlayerStats>(stats_url, {headers: CHESS_API_HEADERS});
        return{
            ok: true,
            username: profile.data.username,
            avatar: profile.data.avatar ?? "/default-pfp-dark.jpg",
            stats: stats.data
        }
    }
    catch(error){
        throw new Error("PLAYER_API_ERROR");
    }
}
