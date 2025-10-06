import { Difficulty, Game, GoalName } from "@/app/goals";
import BingosyncColored from "@/app/matches/BingosyncColored";
import { BingosyncColor } from "@/app/matches/parseBingosyncData";
import { useMemo, useState } from "react";

export type GeneralGoalState = {
  leftChecked: Set<Game>;
  rightChecked: Set<Game>;
  showAll: boolean;
};

interface StateOnly {
  leftColor: BingosyncColor;
  rightColor: BingosyncColor;
  generals: { [name: string]: GeneralGoalState };
  shownDifficulties: ReadonlyArray<Difficulty>;
}

export interface CasterState extends StateOnly {
  setLeftColor: (newColor: BingosyncColor) => unknown;
  setRightColor: (newColor: BingosyncColor) => unknown;
  setGenerals: (newGenerals: ReadonlyArray<GeneralGoalState>) => unknown;
  setShownDifficulties: (newDifficulties: ReadonlyArray<Difficulty>) => unknown;
}

export default function useCasterState(id: string, seed: number): CasterState {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const initialState = useMemo<StateOnly>(() => getInitialState(id, seed), []);
  const [leftColor, setLeftColorRaw] = useState<BingosyncColor>(
    initialState.leftColor
  );
  const [rightColor, setRightColorRaw] = useState<BingosyncColor>(
    initialState.rightColor
  );
  return {};
}

const DEFAULT_STATE: StateOnly = {
  leftColor: "red",
  rightColor: "blue",
  generals: {},
  shownDifficulties: ["veryhard", "general"],
};

function getInitialState(id: string, seed: number): StateOnly {
  if (global.window == undefined || localStorage == null) {
    return DEFAULT_STATE;
  }
  const key = `${id}-${seed}`;
  const fromStorage = localStorage.getItem(key);
  if (fromStorage == null || fromStorage === "") {
    return DEFAULT_STATE;
  }
  try {
    const parsed = JSON.parse(fromStorage);
    return {
      leftColor: parsed.leftColor ?? DEFAULT_STATE.leftColor,
      rightColor: parsed.rightColor ?? DEFAULT_STATE.rightColor,
      generals: parsed.generals ?? DEFAULT_STATE.generals,
      shownDifficulties:
        parsed.shownDifficulties ?? DEFAULT_STATE.shownDifficulties,
    };
  } catch {
    return DEFAULT_STATE;
  }
}
