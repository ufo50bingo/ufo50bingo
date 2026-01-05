"use client";

import { useCallback } from "react";
import { Container, Stack } from "@mantine/core";
import AllAttempts from "./AllAttempts";
import { useAppContext } from "../AppContextProvider";
import { db } from "../db";
import Goal from "./Goal";
import splitAtTokens from "../generator/splitAtTokens";
import { STANDARD_UFO } from "../pastas/standardUfo";
import resolveTokens from "../generator/resolveTokens";
import getResolvedGoalText from "../generator/getResolvedGoalText";

export default function Practice() {
  const {
    attempts,
    goalStats,
    goalParts,
    setGoalParts,
    playlist,
    getRandomGoal,
  } = useAppContext();

  const goToNextGoal = useCallback(async () => {
    if (playlist.length > 0) {
      setGoalParts(
        resolveTokens(splitAtTokens(playlist[0].goal), STANDARD_UFO.tokens)
      );
      db.playlist.delete(playlist[0].id);
    } else {
      setGoalParts(getRandomGoal());
    }
  }, [playlist, setGoalParts, getRandomGoal]);

  const goal = getResolvedGoalText(goalParts);

  return (
    <Container my="md">
      <Stack>
        <Goal
          key={goal}
          goalParts={goalParts}
          onNext={goToNextGoal}
          setGoalParts={setGoalParts}
        />
        <AllAttempts
          attempts={attempts}
          goalStats={goalStats}
          onRetryGoal={(goal: string) =>
            setGoalParts(
              resolveTokens(splitAtTokens(goal), STANDARD_UFO.tokens)
            )
          }
        />
      </Stack>
    </Container>
  );
}
