import { PlayerTrackerRestrictions } from "@/app/generator/ufoGenerator";
import { Difficulty, ORDERED_DIFFICULTY } from "@/app/goals";
import { useCallback, useState } from "react";

const DEFAULT_SHOWN: ReadonlyArray<Difficulty> = [
  "easy",
  "veryhard",
  "general",
];

export default function useShownDifficulties(
  restrictions: PlayerTrackerRestrictions,
): [
  ReadonlyArray<Difficulty>,
  (newShownDifficulties: ReadonlyArray<Difficulty>) => unknown,
] {
  const [shownDifficulties, setShownDifficultiesRaw] = useState<
    ReadonlyArray<Difficulty>
  >(() => {
    const allowed = (restrictions.allowed_difficulty_tags ??
      ORDERED_DIFFICULTY) as ReadonlyArray<Difficulty>;
    const defaultShown = allowed.filter((difficulty) =>
      DEFAULT_SHOWN.includes(difficulty),
    );
    if (global.window == undefined || localStorage == null) {
      return defaultShown;
    }
    const fromStorage = localStorage.getItem("shown_difficulties");
    if (fromStorage == null || fromStorage === "") {
      return defaultShown;
    }
    try {
      const parsed = JSON.parse(fromStorage);
      if (typeof parsed !== "object" || !Array.isArray(parsed)) {
        return defaultShown;
      }
      return allowed.filter((difficulty) => parsed.includes(difficulty));
    } catch {
      return defaultShown;
    }
  });

  const setShownDifficulties = useCallback(
    (newShownDifficulties: ReadonlyArray<Difficulty>) => {
      setShownDifficultiesRaw(newShownDifficulties);
      if (global.window == undefined || localStorage == null) {
        return;
      }
      localStorage.setItem(
        "shown_difficulties",
        JSON.stringify(newShownDifficulties),
      );
    },
    [],
  );

  return [shownDifficulties, setShownDifficulties];
}
