export type AnalyzeControllerResponse =
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

export type AnalysisReport = {
    username: string,
    openings: OpeningData[],
    games: Record<string, GameData>
}

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
  
    openingName: string;
    openingVariation: string;
    ecoUrl: string | null;
  
    timeClass: string;
    timeControl: string;
  
    chessComAccuracy?: number;
  };