import { Difficulty, GoalName } from "@/app/goals";
import { useMemo, useState } from "react";

interface BaseState {
  shownDifficulties: ReadonlyArray<Difficulty>;
  showAll: ReadonlyArray<GoalName>;
}

export interface CasterState extends BaseState {
  addShowAll: (goal: GoalName) => unknown;
  setShownDifficulties: (newDifficulties: ReadonlyArray<Difficulty>) => unknown;
}

export default function useLocalState(id: string, seed: number): CasterState {
  const key = `${id}-${seed}`;

  const initialState = useMemo(() => getInitialState(key), []);
  const [shownDifficulties, setShownDifficultiesRaw] = useState<
    ReadonlyArray<Difficulty>
  >(initialState.shownDifficulties);
  const [showAll, setShowAllRaw] = useState<ReadonlyArray<GoalName>>(
    initialState.showAll
  );

  return useMemo(() => {
    const addShowAll = (goal: GoalName) => {
      const newShowAll = [...showAll, goal];
      setShowAllRaw(newShowAll);
      setLocalStorage(key, { showAll: newShowAll, shownDifficulties });
    };
    const setShownDifficulties = (
      newShownDifficulties: ReadonlyArray<Difficulty>
    ) => {
      setShownDifficultiesRaw(newShownDifficulties);
      setLocalStorage(key, {
        showAll,
        shownDifficulties: newShownDifficulties,
      });
    };
    return {
      showAll,
      shownDifficulties,
      setShownDifficulties,
      addShowAll,
    };
  }, [showAll, shownDifficulties, key]);
}

const DEFAULT_STATE: BaseState = {
  shownDifficulties: ["veryhard", "general"],
  showAll: [],
};

function getInitialState(key: string): BaseState {
  if (global.window == undefined || localStorage == null) {
    return DEFAULT_STATE;
  }
  const fromStorage = localStorage.getItem(key);
  if (fromStorage == null || fromStorage === "") {
    return DEFAULT_STATE;
  }
  try {
    const parsed = JSON.parse(fromStorage);
    return {
      shownDifficulties:
        parsed.shownDifficulties ?? DEFAULT_STATE.shownDifficulties,
      showAll: parsed.showAll ?? DEFAULT_STATE.showAll,
    };
  } catch {
    return DEFAULT_STATE;
  }
}

function setLocalStorage(key: string, state: BaseState): void {
  if (global.window == undefined || localStorage == null) {
    return;
  }
  localStorage.setItem(key, JSON.stringify(state));
}
