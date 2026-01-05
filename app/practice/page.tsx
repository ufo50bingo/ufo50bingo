"use client";

import { useCallback } from "react";
import { Container, Stack } from "@mantine/core";
import AllAttempts from "./AllAttempts";
import { useAppContext } from "../AppContextProvider";
import { db } from "../db";
import Goal from "./Goal";
import splitAtTokens, { ResolvedToken } from "../generator/splitAtTokens";
import { STANDARD_UFO } from "../pastas/standardUfo";
import resolveTokens from "../generator/resolveTokens";
import getResolvedGoalText from "../generator/getResolvedGoalText";
import findGoal from "../findGoal";

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
          onRetryGoal={(goal: string) => {
            const found = findGoal(goal, STANDARD_UFO);
            if (found == null) {
              setGoalParts(
                resolveTokens(splitAtTokens(goal), STANDARD_UFO.tokens)
              );
            } else {
              const split = splitAtTokens(found.goal);
              let tokenIndex = 0;
              setGoalParts(
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
                })
              );
            }
          }}
        />
      </Stack>
    </Container>
  );
}
