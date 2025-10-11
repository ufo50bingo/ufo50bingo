import { Game, Difficulty } from "@/app/goals";
import { SPICY } from "@/app/pastas/spicy";

export const SPICY_GOAL_TO_TYPES: {
  [name: string]: readonly [Game, Difficulty];
} = {};
SPICY.forEach((group) => {
  group.forEach((goal) => {
    SPICY_GOAL_TO_TYPES[goal.name] = goal.types;
  });
});
