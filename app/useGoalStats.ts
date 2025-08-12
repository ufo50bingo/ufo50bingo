import { useMemo } from 'react';
import { AttemptRow } from './db';

export type GoalStats = {
  count: number;
  averageDuration: number;
  bestDuration: number;
};

export default function useGoalStats(attempts: AttemptRow[] | undefined): Map<string, GoalStats> {
  return useMemo(() => {
    const goalToTimes = new Map<string, number[]>();
    attempts?.forEach((attempt) => {
      const existingTimes = goalToTimes.get(attempt.goal);
      if (existingTimes == null) {
        goalToTimes.set(attempt.goal, [attempt.duration]);
      } else {
        existingTimes.push(attempt.duration);
      }
    });
    const goalToStats = new Map();
    goalToTimes.forEach((times, goal) => {
      goalToStats.set(goal, {
        count: times.length,
        averageDuration: times.reduce((acc, val) => acc + val, 0) / times.length,
        bestDuration: Math.min(...times),
      });
    });
    return goalToStats;
  }, [attempts]);
}
