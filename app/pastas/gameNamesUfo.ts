import { UFOPasta } from "../generator/ufoGenerator";
import { GAME_NAMES, ORDERED_PROPER_GAMES } from "../goals";

export const GAME_NAMES_UFO: UFOPasta = {
  goals: {
    normal: Object.fromEntries(
      ORDERED_PROPER_GAMES.map((g) => [g, [GAME_NAMES[g]]]),
    ),
  },
  tokens: {},
  category_counts: {
    normal: 25,
  },
};
