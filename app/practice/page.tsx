"use client";

import { useCallback } from "react";
import { Container, Stack } from "@mantine/core";
import AllAttempts from "./AllAttempts";
import { useAppContext } from "../AppContextProvider";
import { db } from "../db";
import Goal from "./Goal";
import splitAtTokens, { ResolvedToken } from "../generator/splitAtTokens";
import getResolvedGoalText from "../generator/getResolvedGoalText";
import findGoalFromAny from "../findGoalFromAny";
import usePracticePasta, { ALL_PRACTICE_PASTAS } from "../usePracticePasta";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "UFO 50 Bingo Practice",
  description: "Practice UFO 50 Bingo goals and track your stats!",
};

export default function Practice() {
  const {
    attempts,
    goalStats,
    goalPartsAndPasta,
    setGoalPartsAndPasta,
    playlist,
    getRandomGoal,
  } = useAppContext();

  const practicePasta = usePracticePasta();

  const onTryStringGoal = useCallback(
    (goal: string) => {
      const foundPair = findGoalFromAny(goal, [
        practicePasta,
        ...ALL_PRACTICE_PASTAS,
      ]);
      if (foundPair == null) {
        setGoalPartsAndPasta([{ type: "plain", text: goal }], practicePasta);
      } else {
        const found = foundPair.foundGoal;
        const split = splitAtTokens(found.goal);
        let tokenIndex = 0;
        setGoalPartsAndPasta(
          split.map((part) => {
            if (part.type === "plain") {
              return part;
            } else {
              const resolved: ResolvedToken = {
                type: "resolved",
                token: part.token,
                text: found.tokens[tokenIndex],
              };
              tokenIndex += 1;
              return resolved;
            }
          }),
          foundPair.pasta
        );
      }
    },
    [practicePasta, setGoalPartsAndPasta]
  );

  const goToNextGoal = useCallback(async () => {
    if (playlist.length > 0) {
      onTryStringGoal(playlist[0].goal);
      db.playlist.delete(playlist[0].id);
    } else {
      const { goalParts: newGoalparts, pasta: newPasta } = getRandomGoal();
      setGoalPartsAndPasta(newGoalparts, newPasta);
    }
  }, [playlist, setGoalPartsAndPasta, getRandomGoal, onTryStringGoal]);

  const goal = getResolvedGoalText(goalPartsAndPasta.goalParts);

  return (
    <Container my="md">
      <Stack>
        <Goal
          key={goal}
          goalPartsAndPasta={goalPartsAndPasta}
          onNext={goToNextGoal}
          setGoalPartsAndPasta={setGoalPartsAndPasta}
        />
        <AllAttempts
          attempts={attempts}
          goalStats={goalStats}
          onRetryGoal={onTryStringGoal}
        />
      </Stack>
    </Container>
  );
}
