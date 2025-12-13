import { useMemo } from "react";
import { Game } from "../goals";
import { Counts, UFODifficulties } from "../pastas/ufoGenerator";
import DifficultySelectors from "./DifficultySelectors";

type Props = {
    goals: UFODifficulties,
    checkState: Map<Game, boolean>,
    counts: Counts,
    setCounts: (newCounts: Counts) => unknown;
};

export default function UFODifficultySelectors({ goals, checkState, counts, setCounts }: Props) {
    const availableCounts = useMemo(() => {
        const available: { [key: string]: number } = {};
        Object.keys(goals).forEach(difficulty => {
            available[difficulty] = Object.keys(goals[difficulty]).reduce(
                // game isn't guaranteed to be the right type, but that's ok
                (acc, game) => difficulty === 'general' || checkState.get(game as Game) === true
                    ? acc + goals[difficulty][game].length
                    : acc,
                0,
            );
        });
        return available;
    }, [checkState, goals]);
    return <DifficultySelectors availableCounts={availableCounts} counts={counts} setCounts={setCounts} />
}