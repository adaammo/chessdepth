import { OpeningStats, PlayerPayload } from "@/api/lib/types";

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
  | {
    status: "added";
    username: string,
    uuid: string
    result: null;
  }

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

export type GameData = {
  url: string;
  pgn: string;

  userColor: "white" | "black";
  result: "win" | "loss" | "draw"
  opponentUsername: string
  date: number;
  fen: string
  openingName: string;
  openingVariation: string;
  ecoUrl: string | null;

  timeClass: string;
  timeControl: string;

  chessComAccuracy?: number | undefined;
};

export type OpeningExplorerGameColor = "white" | "black";

export interface OpeningExplorerGamePlayer {
  name: string;
  rating: number;
}
interface OpeningExplorerOpening {
  eco: string;
  name: string;
}
interface OpeningExplorerMastersGame {
  black: OpeningExplorerGamePlayer;
  id: string;
  white: OpeningExplorerGamePlayer;
  winner: OpeningExplorerGameColor | null;
  year: number;
  month: string;
}

interface OpeningExplorerMove {
  averageRating: number;
  black: number;
  draws: number;
  game: OpeningExplorerMastersGame | null;
  opening: OpeningExplorerOpening | null;
  san: string;
  uci: string;
  white: number;
}

interface OpeningExplorerTopGame {
  black: OpeningExplorerGamePlayer;
  id: string;
  uci: string;
  white: OpeningExplorerGamePlayer;
  winner: OpeningExplorerGameColor | null;
  year: number;
  month: string;
}

export interface OpeningExplorerMastersResponse {
  black: number;
  draws: number;
  moves: OpeningExplorerMove[];
  opening: OpeningExplorerOpening | null;
  topGames: OpeningExplorerTopGame[];
  white: number;
}