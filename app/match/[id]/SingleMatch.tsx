"use client";

import { Card } from "@mantine/core";
import SingleMatchView from "../SingleMatchView";
import { FullParsedGame } from "@/app/fetchFeed";

type Props = {
  game: FullParsedGame;
};

export default function SingleMatch({ game }: Props) {
  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      <Card
        style={{
          width: "fit-content",
        }}
      >
        <SingleMatchView game={game} />
      </Card>
    </div>
  );
}
