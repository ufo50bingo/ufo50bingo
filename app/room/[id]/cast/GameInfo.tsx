import { GAME_NAMES, ProperGame } from "@/app/goals";
import { Text, Tooltip } from "@mantine/core";
import React from "react";

type Props = {
  game: string;
  description: null | string;
  goals: null | ReadonlyArray<[string, number]>;
};

export default function GameInfo({ game, description, goals }: Props) {
  const name =
    GAME_NAMES[game as ProperGame] != null
      ? GAME_NAMES[game as ProperGame]
      : game;
  const gameName =
    goals != null ? (
      <Tooltip
        label={goals.map((g, index) => {
          const coordinates = `[${Math.floor(g[1] / 5) + 1},${(g[1] % 5) + 1}]`;
          return index === 0 ? (
            <React.Fragment key={g[0]}>
              {g[0]} {coordinates}
            </React.Fragment>
          ) : (
            <React.Fragment key={g[0]}>
              <br />
              {g[0]} {coordinates}
            </React.Fragment>
          );
        })}
      >
        <u>
          <strong>{name}</strong>
        </u>
      </Tooltip>
    ) : (
      name
    );
  const descriptionText = description != null ? ` (${description})` : "";
  return (
    <Text size="sm">
      {gameName}
      {descriptionText}
    </Text>
  );
}
