"use client";

import { Card } from "@mantine/core";
import SingleMatchView from "../SingleMatchView";
import { FullParsedGame } from "@/app/fetchFeed";
import classes from "./SingleMatch.module.css";

type Props = {
  game: FullParsedGame;
};

export default function SingleMatch({ game }: Props) {
  return (
    <div className={classes.container}>
      <Card className={classes.card}>
        <SingleMatchView game={game} />
      </Card>
    </div>
  );
}
