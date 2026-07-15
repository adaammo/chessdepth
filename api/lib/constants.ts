export const CHESS_URL_ARCHIVES = (username: string) => {
return `https://api.chess.com/pub/player/${username}/games/archives`
} ;
export const CHESS_API_HEADERS = {
    "User-Agent": "ProjectUnNamed/1.0 (contact: adaam.mohamed31@gmail.com",
    Accept: "application/json"
}
export const PLAYER_URL = (username: string) => `https://api.chess.com/pub/player/${username}`;
export const STATS_URL = (username: string) => `https://api.chess.com/pub/player/${username}/stats`;
