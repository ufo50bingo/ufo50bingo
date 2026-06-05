import { useMemo } from "react";
import { Counts, UFODifficulties } from "../generator/ufoGenerator";
import DifficultySelectors from "./DifficultySelectors";

type Props = {
  goals: UFODifficulties;
  uncheckedGames: Set<string>;
  counts: Counts;
  setCounts: (newCounts: Counts) => unknown;
};

export default function UFODifficultySelectors({
  goals,
  uncheckedGames,
  counts,
  setCounts,
}: Props) {
  const availableCounts = useMemo(() => {
    const available: { [key: string]: number } = {};
    Object.keys(goals).forEach((difficulty) => {
      available[difficulty] = Object.keys(goals[difficulty]).reduce(
        (acc, game) =>
          !uncheckedGames.has(game)
            ? acc + goals[difficulty][game].length
            : acc,
        0,
      );
    });
    return available;
  }, [goals, uncheckedGames]);
  return (
    <DifficultySelectors
      availableCounts={availableCounts}
      counts={counts}
      setCounts={setCounts}
    />
  );
}
