"use client";

import { Card } from "@mantine/core";
import { Match } from "../../matches/Matches";
import MatchView from "@/app/matches/MatchView";

type Props = {
  match: Match;
};

export default function SingleMatch({ match }: Props) {
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
        <MatchView match={match} />
      </Card>
    </div>
  );
}
