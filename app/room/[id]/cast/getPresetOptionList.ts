import { OptionList } from "@/app/generator/ufoGenerator";
import { GIFTS, GOLDS, CHERRIES, TWO_LEVELS, FOUR_LEVELS, EIGHT_LEVELS, TWO_BOSSES, BOSSES } from "./timeEstimates";

export default function getPresetOptionList(preset: string, inferredGames: ReadonlyArray<string>): OptionList {
  switch (preset) {
    case "$gift":
      return GIFTS;
    case "$gold":
      return GOLDS;
    case "$cherry":
      return CHERRIES;
    case "$two_levels":
      return TWO_LEVELS;
    case "$four_levels":
      return FOUR_LEVELS;
    case "$eight_levels":
      return EIGHT_LEVELS;
    case "$two_bosses":
      return TWO_BOSSES;
    case "$bosses":
      return BOSSES;
    case "$infer":
      return {
        shown: inferredGames,
        shown_if_on_card: [],
        hidden: [],
      };
    default:
      return { shown: [], shown_if_on_card: [], hidden: [] };
  }
}