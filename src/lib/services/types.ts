export type AnalyzeControllerResponse =
    {
        status: "completed";
        username: string,
        uuid: string
        result: AnalysisReport;
    }
    | {
        status: "processing";
        username: string,
        uuid: string
        result: null;
    }
    |  {
        status: "added";
        username: string,
        uuid: string
        result: null;
    }

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
    fen: string
    openingName: string;
    openingVariation: string;
    ecoUrl: string | null;
  
    timeClass: string;
    timeControl: string;
  
    chessComAccuracy?: number | undefined;
  };