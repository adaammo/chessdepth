import { AnalysisReport } from "../services/analyze-service/normalizeGames";
export type OpeningStats = {
    openingName: string,
    count: number
}
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
    avatar: string
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
    openingVariations: Set<string>
    ecoUrl: string | null;

    white: {
    whiteScore: number;
    whitePercentage: number;
    whiteGames: number,
    whiteWins: number,
    whiteLosses: number,
    whiteDraws: number
    }
    black: {
      blackScore: number;
      blackPercentage: number;
      blackGames: number,
      blackWins: number,
      blackLosses: number,
      blackDraws: number
    }
    gameIds: string[];
  };
  type ChessComAccountStatus =
  | "closed"
  | "closed:fair_play_violations"
  | "basic"
  | "premium"
  | "mod"
  | "staff";

type UrlString = string;

export type PlayerProfile = {
  "@id": UrlString;
  url: UrlString; 
  username: string;
  player_id: number;

  title?: string;
  status: ChessComAccountStatus;
  name?: string;
  avatar?: UrlString;
  location?: string;
  country: UrlString;

  joined: number;
  last_online: number;
  followers: number;

  is_streamer?: boolean;
  twitch_url?: UrlString;
  fide?: number;
};

export type PlayerPayload = {
  username: string;
  avatar: string;
  stats: ChessComPlayerStats;
}
  export type GameData = {
      url: string;
      pgn: string;
      date: number;
      opponentUsername: string
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

      type ChessRating = {
        last: {
          rating: number;
          date: number; 
          rd: number;
        };
      
        best: {
          rating: number;
          date: number; 
          game: string;
        };
      
        record: {
          win: number;
          loss: number;
          draw: number;
        };
      };
      
      export type ChessComPlayerStats = {
        chess_rapid: ChessRating;
        chess_bullet: ChessRating;
        chess_blitz: ChessRating;
      };