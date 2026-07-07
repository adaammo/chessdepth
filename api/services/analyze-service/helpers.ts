import { ChessComPlayerResult, GameOutcome } from "@/api/lib/types";

export function getGameOutcome(result: ChessComPlayerResult | string): GameOutcome {
  switch (result) {
    case "win":
      return "win";

    case "agreed":
    case "repetition":
    case "stalemate":
    case "insufficient":
    case "50move":
    case "timevsinsufficient":
      return "draw";

    case "checkmated":
    case "timeout":
    case "resigned":
    case "lose":
    case "abandoned":
    case "kingofthehill":
    case "threecheck":
      return "loss";

    default:
      return "loss";
  }
}

export function getOutcomeScore(outcome: GameOutcome): number {
  if (outcome === "win") return 1;
  if (outcome === "draw") return 0.5;
  return 0;
}

export function getOpeningKey(ecoUrl: string | null): string {
  if (!ecoUrl || ecoUrl == "Undefined") return "unknown-opening";

  return ecoUrl.split("/openings/")[1] ?? ecoUrl;
}
export function ecoRegexHelper(ecoName: string | null): {family: string, variation: string} {
  if (!ecoName || ecoName == "Undefined") return {family: "Unknown-Opening", variation: ""};
  const withoutSuffix = ecoName.replace(
    /(?:[-\s]+\d+\.{1,3}.*|\.{3}\d+\..*)$/g,
    ""
  );
  const PRIMARY_ENDINGS = ["Accepted", "Declined"];

  const SECONDARY_ENDINGS = [
    "Opening",
    "Defense",
    "Defence",
    "Game",
    "Gambit",
    "Attack",
    "System",
    "Countergambit",
  ];
  const noSuffix = withoutSuffix.replace(/-/g, ' ');
  const words = noSuffix.trim().split(/\s+/);

  for (let i = 0; i < words.length; i++) {
    if (PRIMARY_ENDINGS.includes(words[i])) {
      return {
        family: words.slice(0, i + 1).join(" "),
        variation: words.slice(i + 1).join(" ") || "",
      };
    }
  }

  for (let i = 0; i < words.length; i++) {
    if (SECONDARY_ENDINGS.includes(words[i])) {
      return {
        family: words.slice(0, i + 1).join(" "),
        variation: words.slice(i + 1).join(" ") || "",
      };
    }
  }

  return {
    family: ecoName,
    variation: "",
  };
}