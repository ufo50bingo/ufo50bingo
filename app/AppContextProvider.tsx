'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { AttemptRow, db, PlaylistRow } from './db';
import useGoalStats, { GoalStats } from './useGoalStats';
import useSelectedGoals from './useSelectedGoals';

export enum NextGoalChoice {
  RANDOM = 'RANDOM',
  PREFER_FEWER_ATTEMPTS = 'PREFER_FEWER_ATTEMPTS',
}

type AppContextType = {
  attempts: AttemptRow[];
  playlist: PlaylistRow[];
  goalStats: Map<string, GoalStats>;
  selectedGoals: Set<string>;
  setGoal: (goal: string) => void;
  getRandomGoal: () => string;
  setNextGoalChoice: (newNextGoalChoice: NextGoalChoice) => void;
  nextGoalChoice: NextGoalChoice;
  goal: string;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppContextProvider({ children }: { children: React.ReactNode }) {
  const [nextGoalChoice, setNextGoalChoiceRaw] = useState(
    global.window != undefined &&
      localStorage?.getItem('nextGoalChoice') === NextGoalChoice.PREFER_FEWER_ATTEMPTS
      ? NextGoalChoice.PREFER_FEWER_ATTEMPTS
      : NextGoalChoice.RANDOM
  );

  const setNextGoalChoice = useCallback(
    (newNextGoalChoice: NextGoalChoice) => {
      setNextGoalChoiceRaw(newNextGoalChoice);
      window?.localStorage?.setItem('nextGoalChoice', newNextGoalChoice);
    },
    [setNextGoalChoiceRaw]
  );

  const attempts = useLiveQuery(() => db.attempts.orderBy('startTime').reverse().toArray()) ?? [];
  const playlist = useLiveQuery(() => db.playlist.orderBy('priority').toArray()) ?? [];
  const goalStats = useGoalStats(attempts);
  const selectedGoals = useSelectedGoals();

  const getRandomGoal = useCallback(() => {
    switch (nextGoalChoice) {
      case NextGoalChoice.PREFER_FEWER_ATTEMPTS:
        return getGoalPreferFewerAttempts(selectedGoals, goalStats);
      case NextGoalChoice.RANDOM:
      default:
        const items = Array.from(selectedGoals);
        return items[Math.floor(Math.random() * items.length)];
    }
  }, [nextGoalChoice, selectedGoals, goalStats]);

  const [goal, setGoalRaw] = useState(getRandomGoal());
  const setGoal = useCallback(
    (goal: string) => {
      setGoalRaw(goal);
      window.scrollTo({ top: 0, behavior: 'instant' });
    },
    [setGoalRaw]
  );

  const value = useMemo(
    () => ({
      goal,
      attempts,
      playlist,
      goalStats,
      selectedGoals,
      setGoal,
      getRandomGoal,
      setNextGoalChoice,
      nextGoalChoice,
    }),
    [
      goal,
      attempts,
      playlist,
      goalStats,
      selectedGoals,
      setGoal,
      getRandomGoal,
      setNextGoalChoice,
      nextGoalChoice,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within AppContextProvider');
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

  const goalIndex = allCumulativeWeights.findIndex((cutoff) => cutoff >= randomWeight);
  return goals[goalIndex];
}
