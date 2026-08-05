import getAllSubcategories from "@/app/createboard/getAllSubcategories";
import getNonGeneralCategories from "@/app/createboard/getNonGeneralCategories";
import { ORDERED_PROPER_GAMES } from "@/app/goals";
import { NES_50_UFO } from "@/app/pastas/nes50Ufo";

export default function getGameList(isNes50: boolean): ReadonlyArray<string> {
  return isNes50
    ? [
      ...getAllSubcategories(
        NES_50_UFO.goals,
        getNonGeneralCategories(NES_50_UFO),
      ),
    ]
    : ORDERED_PROPER_GAMES;
}