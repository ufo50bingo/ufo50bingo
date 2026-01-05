"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { AttemptRow, db, PlaylistRow } from "./db";
import useGoalStats, { GoalStats } from "./useGoalStats";
import useSelectedGoals from "./useSelectedGoals";
import splitAtTokens, { Plain, ResolvedToken } from "./generator/splitAtTokens";
import resolveTokens from "./generator/resolveTokens";
import { STANDARD_UFO } from "./pastas/standardUfo";

export enum NextGoalChoice {
  RANDOM = "RANDOM",
  PREFER_FEWER_ATTEMPTS = "PREFER_FEWER_ATTEMPTS",
}

type AppContextType = {
  attempts: AttemptRow[];
  playlist: PlaylistRow[];
  goalStats: Map<string, GoalStats>;
  selectedGoals: Set<string>;
  setGoalParts: (goalParts: ReadonlyArray<Plain | ResolvedToken>) => void;
  getRandomGoal: () => ReadonlyArray<Plain | ResolvedToken>;
  setNextGoalChoice: (newNextGoalChoice: NextGoalChoice) => void;
  nextGoalChoice: NextGoalChoice;
  goalParts: ReadonlyArray<Plain | ResolvedToken>;
  createdMatchIDs: Set<string>;
  revealedMatchIDs: null | Set<string>;
  isAdmin: boolean;
  setIsAdmin: (newIsAdmin: boolean) => void;
  hideByDefault: boolean;
  setHideByDefault: (newHideByDefault: boolean) => void;
  isMounted: boolean;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMounted, setIsMounted] = useState(false);
  const [nextGoalChoice, setNextGoalChoiceRaw] = useState(
    global.window != undefined &&
      localStorage?.getItem("nextGoalChoice") ===
        NextGoalChoice.PREFER_FEWER_ATTEMPTS
      ? NextGoalChoice.PREFER_FEWER_ATTEMPTS
      : NextGoalChoice.RANDOM
  );

  useEffect(() => setIsMounted(true), []);

  const setNextGoalChoice = useCallback(
    (newNextGoalChoice: NextGoalChoice) => {
      setNextGoalChoiceRaw(newNextGoalChoice);
      window?.localStorage?.setItem("nextGoalChoice", newNextGoalChoice);
    },
    [setNextGoalChoiceRaw]
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const attempts =
    useLiveQuery(() => db.attempts.orderBy("startTime").reverse().toArray()) ??
    [];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const playlist =
    useLiveQuery(() => db.playlist.orderBy("priority").toArray()) ?? [];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const createdMatches = useLiveQuery(() => db.createdMatches.toArray()) ?? [];
  const createdMatchIDs = useMemo(
    () => new Set(createdMatches.map((match) => match.id)),
    [createdMatches]
  );
  const revealedMatches = useLiveQuery(() => db.revealedMatches.toArray());
  const revealedMatchIDs = useMemo(() => {
    if (revealedMatches == null) {
      return null;
    }
    return new Set(revealedMatches.map((match) => match.id));
  }, [revealedMatches]);
  const goalStats = useGoalStats(attempts);
  const selectedGoals = useSelectedGoals();

  const getRandomGoal = useCallback(() => {
    let goal;
    switch (nextGoalChoice) {
      case NextGoalChoice.PREFER_FEWER_ATTEMPTS:
        goal = getGoalPreferFewerAttempts(selectedGoals, goalStats);
        break;
      case NextGoalChoice.RANDOM:
      default:
        const items = Array.from(selectedGoals);
        goal = items[Math.floor(Math.random() * items.length)];
        break;
    }
    return resolveTokens(splitAtTokens(goal), STANDARD_UFO.tokens);
  }, [nextGoalChoice, selectedGoals, goalStats]);

  // useEffect sets the initial state to avoid hydration errors
  const [goalParts, setGoalPartsRaw] = useState<
    ReadonlyArray<Plain | ResolvedToken>
  >([]);
  // This should intentionally run only once
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => setGoalPartsRaw(getRandomGoal()), []);

  // super insecure, but good enough to stop most people
  const [isAdmin, setIsAdminRaw] = useState(false);
  useEffect(() => {
    setIsAdminRaw(
      global.window != undefined && localStorage?.getItem("isAdmin") === "true"
    );
  }, []);
  const setIsAdmin = useCallback(
    (newIsAdmin: boolean) => {
      setIsAdminRaw(newIsAdmin);
      window?.localStorage?.setItem("isAdmin", newIsAdmin ? "true" : "false");
    },
    [setIsAdminRaw]
  );

  const [hideByDefault, setHideByDefaultRaw] = useState(false);
  useEffect(() => {
    setHideByDefaultRaw(
      global.window != undefined &&
        localStorage?.getItem("hideByDefault") === "true"
    );
  }, []);
  const setHideByDefault = useCallback(
    (newHideByDefault: boolean) => {
      setHideByDefaultRaw(newHideByDefault);
      window?.localStorage?.setItem(
        "hideByDefault",
        newHideByDefault ? "true" : "false"
      );
    },
    [setHideByDefaultRaw]
  );

  const setGoalParts = useCallback(
    (goal: ReadonlyArray<Plain | ResolvedToken>) => {
      setGoalPartsRaw(goal);
      window.scrollTo({ top: 0, behavior: "instant" });
    },
    [setGoalPartsRaw]
  );

  const value = useMemo(
    () => ({
      goalParts,
      attempts,
      playlist,
      goalStats,
      selectedGoals,
      setGoalParts,
      getRandomGoal,
      setNextGoalChoice,
      nextGoalChoice,
      createdMatchIDs,
      revealedMatchIDs,
      isAdmin,
      setIsAdmin,
      hideByDefault,
      setHideByDefault,
      isMounted,
    }),
    [
      goalParts,
      attempts,
      playlist,
      goalStats,
      selectedGoals,
      setGoalParts,
      getRandomGoal,
      setNextGoalChoice,
      nextGoalChoice,
      createdMatchIDs,
      revealedMatchIDs,
      isAdmin,
      setIsAdmin,
      hideByDefault,
      setHideByDefault,
      isMounted,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within AppContextProvider");
  }
  return context;
}

function getGoalPreferFewerAttempts(
  selectedGoals: Set<string>,
  goalStats: Map<string, GoalStats>
): string {
  const goals = Array.from(selectedGoals);

  let cumulativeWeight = 0;
  const allCumulativeWeights: number[] = [];
  goals.forEach((goal) => {
    const count = goalStats.get(goal)?.count ?? 0;
    // if the goal hasn't been done before, it's weighted 4 times as heavily as a single completion
    const weight = count === 0 ? 4 : 1 / count;
    cumulativeWeight += weight;
    allCumulativeWeights.push(cumulativeWeight);
  });

  const randomWeight = Math.random() * cumulativeWeight;

  const goalIndex = allCumulativeWeights.findIndex(
    (cutoff) => cutoff >= randomWeight
  );
  return goals[goalIndex];
}
