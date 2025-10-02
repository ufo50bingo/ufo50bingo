import { Game, Difficulty, SORTED_FLAT_GOALS } from "@/app/goals";

export const GOAL_TO_TYPES: { [name: string]: readonly [Game, Difficulty] } = {};
SORTED_FLAT_GOALS.forEach((goal) => {
    GOAL_TO_TYPES[goal.name] = goal.types;
});