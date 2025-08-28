import { Match } from "./Matches";

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

export function getVariantText(match: Match): string {
  return match.variant + (match.isCustom ? " (Custom)" : "");
}
