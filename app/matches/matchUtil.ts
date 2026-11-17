import { ParsedGame } from "../fetchFeed";

export type WinType = "Bingo" | "Majority" | "Tiebreak";

export function getVariantText(game: ParsedGame): string {
  return (
    game.variant +
    (game.isCustom && game.variant !== "10 Cherry Race" ? " (Custom)" : "") +
    (game.isDraft ? " Draft" : "")
  );
}
