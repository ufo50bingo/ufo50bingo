import getAllSubcategories from "@/app/createboard/getAllSubcategories";
import getNonGeneralCategories from "@/app/createboard/getNonGeneralCategories";
import { UFOPasta } from "@/app/generator/ufoGenerator";
import { ORDERED_PROPER_GAMES } from "@/app/goals";
import { NES_50_UFO } from "@/app/pastas/nes50Ufo";

export type GameList = { [game: string]: string };

const UFO_50_GAME_LIST = Object.fromEntries(
  ORDERED_PROPER_GAMES.map((game) => [game, `/games/${game}.png`]),
);
const NES_50_GAME_LIST = Object.fromEntries(
  inferGamesFromPasta(NES_50_UFO).map((game) => [
    game,
    `/nes50boxart/${encodeURIComponent(game)}.png`,
  ]),
);

export default function getGameList(pasta: null | UFOPasta): GameList {
  if (pasta == null || pasta.current_game_options == null) {
    return UFO_50_GAME_LIST;
  }
  const rawOptions = pasta.current_game_options;
  if (typeof rawOptions === "string") {
    switch (rawOptions) {
      case "$ufo50":
        return UFO_50_GAME_LIST;
      case "$nes50":
        return NES_50_GAME_LIST;
      case "$infer":
        return Object.fromEntries(
          inferGamesFromPasta(pasta).map((game) => [game, ""]),
        );
      default:
        return UFO_50_GAME_LIST;
    }
  }
  return rawOptions;
}

function inferGamesFromPasta(pasta: UFOPasta): ReadonlyArray<string> {
  return [...getAllSubcategories(pasta.goals, getNonGeneralCategories(pasta))];
}
