import { TBoard } from "@/app/matches/parseBingosyncData";
import { GOAL_TO_TYPES } from "./goalToTypes";
import { SimpleGrid } from "@mantine/core";
import GeneralGoal from "./GeneralGoal";
import { GoalName } from "@/app/goals";
import { useMemo } from "react";
import findAllGames from "./findAllGames";

type Props = {
  board: TBoard;
};

export default function GeneralGoals({ board }: Props) {
  const generals = board.filter(
    (square) => GOAL_TO_TYPES[square.name][1] === "general"
  );
  const allGames = useMemo(() => findAllGames(board), [board]);
  return (
    <SimpleGrid cols={generals.length}>
      {generals.map((g) => (
        <GeneralGoal
          key={g.name}
          allGames={allGames}
          name={g.name as GoalName}
          isChecked={g.color !== "blank"}
        />
      ))}
    </SimpleGrid>
  );
}
