import { Difficulty } from "@/app/goals";
import useLocalBool from "@/app/localStorage/useLocalBool";
import useLocalEnum from "@/app/localStorage/useLocalEnum";
import { useMemo, useState } from "react";

export type SortType = "fast" | "alphabetical" | "chronological";
export type IconType = "winnerbit" | "sprites";

interface BaseState {
  shownDifficulties: ReadonlyArray<Difficulty>;
  showAll: ReadonlyArray<string>;
}

export interface CasterState extends BaseState {
  addShowAll: (goal: string) => unknown;
  setShownDifficulties: (newDifficulties: ReadonlyArray<Difficulty>) => unknown;
  sortType: SortType;
  setSortType: (newSortType: SortType) => unknown;
  iconType: IconType;
  setIconType: (newIconType: IconType) => unknown;
  hideByDefault: boolean;
  setHideByDefault: (newHideByDefault: boolean) => unknown;
  showGameSelector: boolean;
  setShowGameSelector: (newShowGameSelector: boolean) => unknown;
  highlightCurrentGame: boolean;
  setHighlightCurrentGame: (newHighlightCurrentGame: boolean) => unknown;
  showRecentGames: boolean;
  setShowRecentGames: (newShowRecentGames: boolean) => unknown;
}

export default function useLocalState(id: string, seed: number): CasterState {
  const key = `${id}-${seed}`;

  const initialState = useMemo(() => getInitialState(key), [key]);
  const [shownDifficulties, setShownDifficultiesRaw] = useState<
    ReadonlyArray<Difficulty>
  >(initialState.shownDifficulties);
  const [showAll, setShowAllRaw] = useState<ReadonlyArray<string>>(
    initialState.showAll
  );
  const [sortType, setSortType] = useLocalEnum<SortType>({
    key: "sort_type",
    defaultValue: "fast",
    options: ["fast", "alphabetical", "chronological"],
  });
  const [iconType, setIconType] = useLocalEnum<IconType>({
    key: "icon_type",
    defaultValue: "winnerbit",
    options: ["winnerbit", "sprites"],
  });
  const [hideByDefault, setHideByDefault] = useLocalBool({
    key: "hide_by_default",
    defaultValue: false,
  });
  const [showGameSelector, setShowGameSelector] = useLocalBool({
    key: "show_game_selector",
    defaultValue: true,
  });
  const [highlightCurrentGame, setHighlightCurrentGame] = useLocalBool({
    key: "highlight_current_game",
    defaultValue: true,
  });
  const [showRecentGames, setShowRecentGames] = useLocalBool({
    key: "show_recent_games",
    defaultValue: true,
  });

  return useMemo(() => {
    const addShowAll = (goal: string) => {
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
      sortType,
      setSortType,
      iconType,
      setIconType,
      hideByDefault,
      setHideByDefault,
      showGameSelector,
      setShowGameSelector,
      highlightCurrentGame,
      setHighlightCurrentGame,
      showRecentGames,
      setShowRecentGames,
    };
  }, [
    showAll,
    shownDifficulties,
    sortType,
    setSortType,
    key,
    iconType,
    setIconType,
    hideByDefault,
    setHideByDefault,
    showGameSelector,
    setShowGameSelector,
    highlightCurrentGame,
    setHighlightCurrentGame,
    showRecentGames,
    setShowRecentGames,
  ]);
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
