import { UFODifficulties } from "./ufoGenerator";

const REGEX = /\{\{([^{}]*)\}\}/g;

export default function findAllTokens(goals: UFODifficulties): { [token: string]: number } {
  const tokenToMaxOccurrences: { [token: string]: number } = {};
  Object.keys(goals).forEach(category => {
    const categoryGoals = goals[category];
    Object.keys(categoryGoals).forEach(group => {
      const groupGoals = categoryGoals[group];
      groupGoals.forEach(goal => {
        const matches = [...goal.matchAll(REGEX)];
        const tokens = matches.map(match => match[1]);
        const localCounts: { [token: string]: number } = {};
        tokens.forEach(token => {
          const existing = localCounts[token] ?? 0;
          localCounts[token] = existing + 1;
        });
        Object.keys(localCounts).forEach(token => {
          const bestCount = Math.max(tokenToMaxOccurrences[token] ?? 0, localCounts[token]);
          tokenToMaxOccurrences[token] = bestCount;
        });
      });
    })
  });
  return tokenToMaxOccurrences;
}
