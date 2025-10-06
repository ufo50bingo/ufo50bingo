import { Game, GAME_NAMES, GoalName } from "@/app/goals";
import { Tooltip } from "@mantine/core";
import React from "react";

type Props = {
  game: Game;
  description: null | string;
  goals: null | ReadonlyArray<GoalName>;
};

export default function GameInfo({ game, description, goals }: Props) {
  const gameName =
    goals != null ? (
      <Tooltip
        label={goals.map((g, index) =>
          index === 0 ? (
            <React.Fragment key={g}>{g}</React.Fragment>
          ) : (
            <React.Fragment key={g}>
              <br />
              {g}
            </React.Fragment>
          )
        )}
      >
        <u>
          <strong>{GAME_NAMES[game]}</strong>
        </u>
      </Tooltip>
    ) : (
      GAME_NAMES[game]
    );
  const descriptionText = description != null ? ` (${description})` : "";
  return (
    <>
      {gameName}
      {descriptionText}
    </>
  );
}
