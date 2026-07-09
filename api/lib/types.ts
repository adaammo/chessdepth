import { AnalysisReport } from "../services/analyze-service/normalizeGames";

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

  export type ChessComPlayerResult =
  | "win"
  | "checkmated"
  | "agreed"
  | "repetition"
  | "timeout"
  | "resigned"
  | "stalemate"
  | "lose"
  | "insufficient"
  | "50move"
  | "abandoned"
  | "kingofthehill"
  | "threecheck"
  | "timevsinsufficient";

  export type GameOutcome = "win" | "draw" | "loss";

  export type OpeningData = {
    openingName: string;
    openingVariation: string;
    ecoUrl: string | null;
  
    games: number;
    wins: number;
    losses: number;
    draws: number;
  
    score: number;
    scorePercent: number;
  
    gameIds: string[];
  };

  export type GameData = {
      url: string;
      pgn: string;
    
      userColor: "white" | "black";
      result: "win" | "loss" | "draw"
      fen: string
      openingName: string;
      openingVariation: string;
      ecoUrl: string | null;
    
      timeClass: string;
      timeControl: string;
    
      chessComAccuracy?: number | undefined;
    };

    type AnalyzeControllerResponse = 
      {
        status: "completed";
        jobId: string;
        fromCache: true;
        result: AnalysisReport;
      }
    | {
        status: "processing";
        jobId: string;
        fromExistingJob: true;
        state: "waiting" | "active" | "delayed";
        result: null;
      }
    | {
        status: "queued";
        jobId: string;
        fromExistingJob: false;
        state: "waiting";
        result: null;
      };