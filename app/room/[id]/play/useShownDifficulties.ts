import { Difficulty } from "@/app/goals";
import { useCallback, useState } from "react";

export default function useShownDifficulties(): [
  ReadonlyArray<Difficulty>,
  (newShownDifficulties: ReadonlyArray<Difficulty>) => unknown
] {
  const [shownDifficulties, setShownDifficultiesRaw] = useState<
    ReadonlyArray<Difficulty>
  >(() => {
    if (global.window == undefined || localStorage == null) {
      return ['general'];
    }
    const fromStorage = localStorage.getItem("shown_difficulties");
    if (fromStorage == null || fromStorage === "") {
      return ['general'];
    }
    try {
      const parsed = JSON.parse(fromStorage);
      if (typeof parsed !== "object") {
        return ['general'];
      }
      return parsed;
    } catch {
      return ['general'];
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
        JSON.stringify(newShownDifficulties)
      );
    },
    []
  );

  return [shownDifficulties, setShownDifficulties];
}
