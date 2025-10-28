import { Difficulty, GoalName } from "@/app/goals";
import { useMemo, useState } from "react";

export type SortType = "fast" | "alphabetical" | "chronological";
export type IconType = "winnerbit" | "sprites";

interface BaseState {
  shownDifficulties: ReadonlyArray<Difficulty>;
  showAll: ReadonlyArray<GoalName>;
}

export interface CasterState extends BaseState {
  addShowAll: (goal: GoalName) => unknown;
  setShownDifficulties: (newDifficulties: ReadonlyArray<Difficulty>) => unknown;
  sortType: SortType;
  setSortType: (newSortType: SortType) => unknown;
  iconType: IconType;
  setIconType: (newIconType: IconType) => unknown;
  hideByDefault: boolean;
  setHideByDefault: (newHideByDefault: boolean) => unknown;
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
  const [sortType, setSortTypeRaw] = useState<SortType>(() => {
    if (global.window == undefined || localStorage == null) {
      return "fast";
    }
    const fromStorage = localStorage.getItem("sort_type");
    if (fromStorage == null || fromStorage === "") {
      return "fast";
    }
    switch (fromStorage) {
      case "fast":
        return "fast";
      case "alphabetical":
        return "alphabetical";
      case "chronological":
        return "chronological";
      default:
        return "fast";
    }
  });
  const [iconType, setIconTypeRaw] = useState<IconType>(() => {
    if (global.window == undefined || localStorage == null) {
      return "winnerbit";
    }
    const fromStorage = localStorage.getItem("icon_type");
    if (fromStorage == null || fromStorage === "") {
      return "winnerbit";
    }
    switch (fromStorage) {
      case "sprites":
        return "sprites";
      case "winnerbit":
        return "winnerbit";
      default:
        return "winnerbit";
    }
  });

  const [hideByDefault, setHideByDefaultRaw] = useState<boolean>(() => {
    if (global.window == undefined || localStorage == null) {
      return false;
    }
    const fromStorage = localStorage.getItem("hide_by_default");
    return fromStorage === "true";
  });

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
    const setSortType = (newSortType: SortType) => {
      setSortTypeRaw(newSortType);
      if (global.window == undefined || localStorage == null) {
        return;
      }
      localStorage.setItem("sort_type", newSortType);
    };
    const setIconType = (newIconType: IconType) => {
      setIconTypeRaw(newIconType);
      if (global.window == undefined || localStorage == null) {
        return;
      }
      localStorage.setItem("icon_type", newIconType);
    };
    const setHideByDefault = (newHideByDefault: boolean) => {
      setHideByDefaultRaw(newHideByDefault);
      if (global.window == undefined || localStorage == null) {
        return;
      }
      localStorage.setItem(
        "hide_by_default",
        newHideByDefault ? "true" : "false"
      );
    };
    return {
      showAll,
      shownDifficulties,
      setShownDifficulties,
      addShowAll,
      sortType,
      setSortType,
      iconType,
      setIconType,
      hideByDefault,
      setHideByDefault,
    };
  }, [showAll, shownDifficulties, sortType, key, iconType, hideByDefault]);
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
