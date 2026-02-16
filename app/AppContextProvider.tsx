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
import splitAtTokens, { Plain, ResolvedToken } from "./generator/splitAtTokens";
import resolveTokens from "./generator/resolveTokens";
import usePracticePasta from "./usePracticePasta";
import { UFOPasta } from "./generator/ufoGenerator";
import { STANDARD_UFO } from "./pastas/standardUfo";
import getFlatGoals, { UFOGoal } from "./generator/getFlatGoals";
import findGoal from "./findGoal";

export enum NextGoalChoice {
  RANDOM = "RANDOM",
  PREFER_FEWER_ATTEMPTS = "PREFER_FEWER_ATTEMPTS",
}

type AppContextType = {
  attempts: AttemptRow[];
  playlist: PlaylistRow[];
  goalStats: Map<string, GoalStats>;
  unselectedGoals: Set<string>;
  setGoalPartsAndPasta: (
    goalParts: ReadonlyArray<Plain | ResolvedToken>,
    pasta: UFOPasta
  ) => void;
  getRandomGoal: () => GoalPartsAndPasta;
  setNextGoalChoice: (newNextGoalChoice: NextGoalChoice) => void;
  nextGoalChoice: NextGoalChoice;
  goalPartsAndPasta: GoalPartsAndPasta;
  revealedMatchIDs: null | Set<string>;
  hideByDefault: boolean;
  setHideByDefault: (newHideByDefault: boolean) => void;
  isMounted: boolean;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export type GoalPartsAndPasta = {
  goalParts: ReadonlyArray<Plain | ResolvedToken>;
  pasta: UFOPasta;
};

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
    useLiveQuery(() =>
      db.attempts
        .orderBy("startTime")
        .filter((attempt) => attempt.goal != null && attempt.goal !== "")
        .reverse()
        .toArray()
    ) ?? [];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const playlist =
    useLiveQuery(() => db.playlist.orderBy("priority").toArray()) ?? [];
  const revealedMatches = useLiveQuery(() => db.revealedMatches.toArray());
  const revealedMatchIDs = useMemo(() => {
    if (revealedMatches == null) {
      return null;
    }
    return new Set(revealedMatches.map((match) => match.id));
  }, [revealedMatches]);
  const goalStats = useGoalStats(attempts);
  const pasta = usePracticePasta();
  const unselectedGoalsArray = useLiveQuery(() => db.unselectedGoals.toArray());
  const unselectedGoals = useMemo(
    () => new Set(unselectedGoalsArray?.map((row) => row.goal) ?? []),
    [unselectedGoalsArray]
  );

  const getRandomGoal = useCallback(() => {
    const selectedGoals = getFlatGoals(pasta)
      .filter((goal) => !unselectedGoals.has(goal.name));
    let goal;
    switch (nextGoalChoice) {
      case NextGoalChoice.PREFER_FEWER_ATTEMPTS:
        goal = getGoalPreferFewerAttempts(selectedGoals, goalStats);
        break;
      case NextGoalChoice.RANDOM:
      default:
        goal = selectedGoals[Math.floor(Math.random() * selectedGoals.length)];
        break;
    }
    return {
      goalParts: resolveTokens(splitAtTokens(goal.name), pasta, goal.sortTokens),
      pasta,
    };
  }, [nextGoalChoice, unselectedGoals, goalStats, pasta]);

  // useEffect sets the initial state to avoid hydration errors
  const [goalPartsAndPasta, setGoalPartsAndPastaRaw] =
    useState<GoalPartsAndPasta>({ goalParts: [], pasta: STANDARD_UFO });
  useEffect(
    () => setGoalPartsAndPastaRaw(getRandomGoal()),
    // This should intentionally run only on initialization and when pasta changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pasta]
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

  const setGoalPartsAndPasta = useCallback(
    (goal: ReadonlyArray<Plain | ResolvedToken>, newPasta: UFOPasta) => {
      setGoalPartsAndPastaRaw({ goalParts: goal, pasta: newPasta });
      window.scrollTo({ top: 0, behavior: "instant" });
    },
    [setGoalPartsAndPastaRaw]
  );

  const value = useMemo(
    () => ({
      goalPartsAndPasta,
      attempts,
      playlist,
      goalStats,
      unselectedGoals,
      setGoalPartsAndPasta,
      getRandomGoal,
      setNextGoalChoice,
      nextGoalChoice,
      revealedMatchIDs,
      hideByDefault,
      setHideByDefault,
      isMounted,
    }),
    [
      goalPartsAndPasta,
      attempts,
      playlist,
      goalStats,
      unselectedGoals,
      setGoalPartsAndPasta,
      getRandomGoal,
      setNextGoalChoice,
      nextGoalChoice,
      revealedMatchIDs,
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
  selectedGoals: ReadonlyArray<UFOGoal>,
  goalStats: Map<string, GoalStats>
): UFOGoal {
  let cumulativeWeight = 0;
  const allCumulativeWeights: number[] = [];
  selectedGoals.forEach((goal) => {
    const count = goalStats.get(goal.name)?.count ?? 0;
    // if the goal hasn't been done before, it's weighted 4 times as heavily as a single completion
    const weight = count === 0 ? 4 : 1 / count;
    cumulativeWeight += weight;
    allCumulativeWeights.push(cumulativeWeight);
  });

  const randomWeight = Math.random() * cumulativeWeight;

  const goalIndex = allCumulativeWeights.findIndex(
    (cutoff) => cutoff >= randomWeight
  );
  return selectedGoals[goalIndex];
}
