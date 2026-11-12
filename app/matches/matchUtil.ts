import { ParsedGame } from "../fetchFeed";
import { Match } from "./Matches";

export type WinType = "Bingo" | "Majority" | "Tiebreak";

export function getWinType(match: Match): null | string {
  if (match.winner != null && match.opponent != null) {
    return match.hasBingo
      ? "Bingo"
      : match.winner.score > match.opponent.score
        ? "Majority"
        : "Tiebreak";
  } else {
    return null;
  }
}

export function getVariantText(game: ParsedGame): string {
  return (
    game.variant +
    (game.isCustom && game.variant !== "10 Cherry Race" ? " (Custom)" : "") +
    (game.isDraft ? " Draft" : "")
  );
}
