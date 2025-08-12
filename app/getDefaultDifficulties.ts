import { Pasta } from './createPasta';
import { Difficulty } from './goals';

export default function getDefaultDifficulties(pasta: Pasta): Map<Difficulty, number> {
  // IMPORTANT: Assumption is that all goals in a grouping will share the same difficulty
  const counts = new Map<Difficulty, number>();
  pasta.forEach((group) => counts.set(group[0].types[1], (counts.get(group[0].types[1]) ?? 0) + 1));
  return counts;
}
