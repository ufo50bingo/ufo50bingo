import { Difficulty, GoalName } from "@/app/goals";
import { BingosyncColor } from "@/app/matches/parseBingosyncData";
import { useMemo, useState } from "react";

export type GeneralGoalState = {
  leftCounts: { [game: string]: number };
  rightCounts: { [game: string]: number };
  showAll: boolean;
};

export type Generals = { [name: string]: GeneralGoalState };

interface BaseState {
  leftColor: BingosyncColor;
  rightColor: BingosyncColor;
  shownDifficulties: ReadonlyArray<Difficulty>;
}

interface StateOnly extends BaseState {
  generals: Generals;
}

export interface CasterState extends StateOnly {
  setLeftColor: (newColor: BingosyncColor) => unknown;
  setRightColor: (newColor: BingosyncColor) => unknown;
  setGeneral: (goal: GoalName, newGenerals: GeneralGoalState) => unknown;
  clearGenerals: () => unknown;
  setShownDifficulties: (newDifficulties: ReadonlyArray<Difficulty>) => unknown;
}

export default function useCasterState(id: string, seed: number): CasterState {
  const key = `${id}-${seed}`;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const initialState = useMemo<StateOnly>(() => getInitialState(key), []);
  const [leftColor, setLeftColorRaw] = useState<BingosyncColor>(
    initialState.leftColor
  );
  const [rightColor, setRightColorRaw] = useState<BingosyncColor>(
    initialState.rightColor
  );
  const [generals, setGeneralsRaw] = useState<Generals>(initialState.generals);
  const [shownDifficulties, setShownDifficultiesRaw] = useState<
    ReadonlyArray<Difficulty>
  >(initialState.shownDifficulties);

  return useMemo(() => {
    const fullState = {
      leftColor,
      rightColor,
      generals,
      shownDifficulties,
    };
    const setLeftColor = (newLeftColor: BingosyncColor) => {
      setLeftColorRaw(newLeftColor);
      setLocalStorage(key, { ...fullState, leftColor: newLeftColor });
    };
    const setRightColor = (newRightColor: BingosyncColor) => {
      setRightColorRaw(newRightColor);
      setLocalStorage(key, { ...fullState, rightColor: newRightColor });
    };
    const setGeneral = (goal: GoalName, newGeneralState: GeneralGoalState) => {
      const newGenerals = {
        ...generals,
        [goal]: newGeneralState,
      };
      console.log("new generals", newGenerals);
      setGeneralsRaw(newGenerals);
      setLocalStorage(key, { ...fullState, generals: newGenerals });
    };
    const clearGenerals = () => {
      setGeneralsRaw({});
      setLocalStorage(key, { ...fullState, generals: {} });
    };
    const setShownDifficulties = (
      newShownDifficulties: ReadonlyArray<Difficulty>
    ) => {
      setShownDifficultiesRaw(newShownDifficulties);
      setLocalStorage(key, {
        ...fullState,
        shownDifficulties: newShownDifficulties,
      });
    };
    return {
      ...fullState,
      setLeftColor,
      setRightColor,
      setGeneral,
      clearGenerals,
      setShownDifficulties,
    };
  }, [leftColor, rightColor, generals, shownDifficulties, key]);
}

const DEFAULT_STATE: StateOnly = {
  leftColor: "red",
  rightColor: "red",
  generals: {},
  shownDifficulties: ["veryhard", "general"],
};

function getInitialState(key: string): StateOnly {
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

function setLocalStorage(key: string, state: StateOnly): void {
  if (global.window == undefined || localStorage == null) {
    return;
  }
  localStorage.setItem(key, JSON.stringify(state));
}
