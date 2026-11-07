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
  id: string;
  url: string;
  pgn: string;
  date: number;
  white_username: string
  black_username: string
  userColor: "white" | "black";
  result: "black_won" | "white_won" | "draw"
  fen: string
  openingName: string;
  openingVariation: string;
  ecoUrl: string | null;

  timeClass: string;
  timeControl: string;

  chessComAccuracy?: number | undefined;
  white_rating: number;
  black_rating: number;
  white_ending: ChessComPlayerResult;
  black_ending: ChessComPlayerResult
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

export type GamesDatabase = {
  id: string,
  opening: string
  pgn: string,
  white_username: string,
  black_username: string,
  result: "black_won" | "white_won" | "draw"
  played_at: number
  opening_variation: string,
  time_class: string,
  time_control: string
  white_rating: number;
  black_rating: number;
  white_ending: ChessComPlayerResult;
  black_ending: ChessComPlayerResult;
  fen: string;
}
export type ProfileDatabase = {
  username: string,
  profile_pic: string,
  profile_url: string,
  total_games: number,
  rapid_rating: number,
  blitz_rating: number,
  bullet_rating: number,
  opening_stats: OpeningData[],
  synced_at: number
  highest_seen_opening: string,
  highest_seen_opening_count: number;
  win_rate: number
  best_outcome_opening: string;
  best_outcome_opening_count: number
}
export type GamesAPIResponse = {
  games: GamesDatabase[];
  nextOffset: number;
  hasMore: boolean
}
export type AllGamesAPIResponse = {
  games: GamesDatabase[];
  nextOffset: number;
  hasMore: boolean;
}
