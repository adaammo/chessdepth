export type AnalyzeGame = {
    username: string
}
export type ChessArchivesResponse = {
    archives: string[];
};
// for monthlychesstype
type ChessPlayer = {
    rating: number;
    result: string;
    "@id": string;
    username: string;
    uuid: string;
  };

  
export type ChessGame = {
    url: string;
    pgn: string;
    time_control: string;
    end_time: number;
    rated: boolean;

    accuracies?: {
        white: number;
        black: number;
    };
    tcn?: string;
    uuid: string;

    initial_setup: string;
    fen: string;
    start_time?: number;
    time_class: "bullet" | "blitz" | "rapid" | "daily" | string;
    rules: "chess" | string;
    white: ChessPlayer;
    black: ChessPlayer;
    eco?: string;
}
export type ChessMonthlyGamesResponse = {
    games: ChessGame[];
  };