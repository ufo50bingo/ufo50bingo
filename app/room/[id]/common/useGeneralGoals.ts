import findGoal from "@/app/findGoal";
import { UFOPasta } from "@/app/generator/ufoGenerator";
import { EVERY_GAME_UFO } from "@/app/pastas/everyGameUfo";
import { NES_50_UFO } from "@/app/pastas/nes50Ufo";
import { STANDARD_UFO } from "@/app/pastas/standardUfo";
import { useMemo } from "react";
import { GeneralItem, FoundStandardGeneral } from "../cast/Cast";

export default function useGeneralGoals(
  pasta: null | UFOPasta,
  squareNames: ReadonlyArray<string>,
): ReadonlyArray<GeneralItem> {
  return useMemo(() => {
    return squareNames
      .map((name, squareIndex) => {
        const pastasToCheck =
          pasta != null ? [pasta] : [STANDARD_UFO, NES_50_UFO, EVERY_GAME_UFO];
        for (const pastaToCheck of pastasToCheck) {
          const foundGoal = findGoal(name, pastaToCheck);
          if (foundGoal != null) {
            if (foundGoal.cast == null) {
              return null;
            }
            return {
              foundGoal: foundGoal as FoundStandardGeneral,
              pasta: pastaToCheck,
              squareIndex,
            };
          }
        }
        return null;
      })
      .filter((item) => item != null);
  }, [pasta, squareNames]);
}
