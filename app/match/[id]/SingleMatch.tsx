"use client";

import { Card } from "@mantine/core";
import { Match } from "../../matches/Matches";
import MatchView from "@/app/matches/MatchView";

type Props = {
  match: Match;
};

export default function SingleMatch({ match }: Props) {
  return (
    <Card
      style={{
        alignSelf: "center",
        justifySelf: "center",
        width: "fit-content",
      }}
    >
      <MatchView match={match} />
    </Card>
  );
}
