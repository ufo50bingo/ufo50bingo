import { useState } from "react";
import {
  IconArrowForward,
  IconArrowsShuffle,
  IconCircleCheck,
  IconHelp,
  IconPlayerPause,
  IconPlayerPlay,
  IconReload,
} from "@tabler/icons-react";
import { ActionIcon, Badge, Button, Card, Group, Stack, Text, Tooltip } from "@mantine/core";
import { db } from "../db";
import useTimer from "../useTimer";
import { Plain, ResolvedToken } from "../generator/splitAtTokens";
import EditableParts from "../goals/EditableParts";
import resolveTokens from "../generator/resolveTokens";
import getResolvedGoalText from "../generator/getResolvedGoalText";
import { GoalPartsAndPasta } from "../AppContextProvider";
import { UFOPasta } from "../generator/ufoGenerator";
import findGoal from "../findGoal";
import getCategoryName from "../generator/getCategoryName";
import { STANDARD_UFO } from "../pastas/standardUfo";
import { DOC_LINKS } from "./docLinks";
import { ProperGame } from "../goals";
import Link from "next/link";

enum State {
  NOT_STARTED,
  RUNNING,
  PAUSED,
  DONE,
}

type Props = {
  goalPartsAndPasta: GoalPartsAndPasta;
  setGoalPartsAndPasta: (
    goalParts: ReadonlyArray<Plain | ResolvedToken>,
    pasta: UFOPasta
  ) => void;
  onNext: () => void;
};

export default function Goal({
  goalPartsAndPasta,
  setGoalPartsAndPasta,
  onNext,
}: Props) {
  const { goalParts, pasta } = goalPartsAndPasta;
  const { start, pause, reset, timer, getDurationMS } = useTimer();
  const [firstStartTime, setFirstStartTime] = useState(0);

  const [state, setState] = useState(State.NOT_STARTED);

  const goal = getResolvedGoalText(goalParts);

  const startTimer = () => {
    start();
    setState(State.RUNNING);
  };

  const doneButton = (
    <Button
      leftSection={<IconCircleCheck />}
      color="green"
      onClick={() => {
        const newRow = {
          goal,
          startTime: firstStartTime,
          duration: getDurationMS(),
        };
        db.attempts.add(newRow);
        if (state === State.RUNNING) {
          pause();
        }
        setState(State.DONE);
      }}
    >
      Done
    </Button>
  );

  const newGoalButton = (
    <Button leftSection={<IconArrowForward />} onClick={onNext}>
      New Goal
    </Button>
  );

  const randomizeTokensButton = goalParts.some(
    (part) => part.type !== "plain"
  ) ? (
    <Button
      leftSection={<IconArrowsShuffle />}
      onClick={() => {
        let newParts;
        const foundGoal = findGoal(goal, pasta);
        do {
          newParts = resolveTokens(
            goalParts.map((part) =>
              part.type === "resolved"
                ? { type: "token", token: part.token }
                : part
            ),
            pasta,
            foundGoal?.sortTokens,
          );
        } while (getResolvedGoalText(newParts) === goal);
        setGoalPartsAndPasta(newParts, pasta);
      }}
    >
      Randomize Tokens
    </Button>
  ) : undefined;

  let content;
  switch (state) {
    case State.NOT_STARTED:
      content = (
        <>
          {newGoalButton}
          {randomizeTokensButton}
          <Button
            leftSection={<IconPlayerPlay />}
            color="green"
            onClick={() => {
              startTimer();
              setFirstStartTime(Date.now());
            }}
          >
            Start
          </Button>
        </>
      );
      break;
    case State.RUNNING: {
      content = (
        <>
          <Text>{timer}</Text>
          <Button
            leftSection={<IconPlayerPause />}
            onClick={() => {
              pause();
              setState(State.PAUSED);
            }}
          >
            Pause
          </Button>
          {doneButton}
        </>
      );
      break;
    }
    case State.PAUSED: {
      content = (
        <>
          <Text>{timer}</Text>
          <Button leftSection={<IconPlayerPlay />} onClick={startTimer}>
            Resume
          </Button>
          {doneButton}
        </>
      );
      break;
    }
    case State.DONE:
      content = (
        <>
          <Text>{timer}</Text>
          <Button
            leftSection={<IconReload />}
            onClick={() => {
              reset();
              setState(State.NOT_STARTED);
            }}
          >
            Try Again
          </Button>
          {randomizeTokensButton}
          {newGoalButton}
        </>
      );
      break;
  }

  const foundGoal = findGoal(goal, pasta);
  const category = foundGoal?.category;
  const subcategory = foundGoal?.subcategory;

  let resourceLink = null;
  if (pasta === STANDARD_UFO && category != null && subcategory != null) {
    if (category === "general") {
      resourceLink = DOC_LINKS["general"];
    } else {
      resourceLink = DOC_LINKS[subcategory as ProperGame];
    }
  }

  return (
    <Card shadow="sm" padding="sm" radius="md" withBorder>
      <Stack gap={8}>
        <Group justify="space-between">
          <Text>
            <strong>
              <EditableParts
                parts={goalParts}
                setParts={(newParts) =>
                  setGoalPartsAndPasta(
                    newParts as ReadonlyArray<Plain | ResolvedToken>,
                    pasta
                  )
                }
                canClear={false}
                tokens={pasta.tokens}
              />
            </strong>
          </Text>
          <Group gap={4}>
            {category != null && (
              <Badge color="cyan" size="sm">
                {getCategoryName(category)}
              </Badge>
            )}
            {resourceLink != null && (
              <Tooltip label="View community-maintained resources for this game">
                <ActionIcon
                  variant="subtle"
                  component={Link}
                  href={resourceLink}
                  target="_blank"
                >
                  <IconHelp size={18} />
                </ActionIcon>
              </Tooltip>
            )}
          </Group>
        </Group>
        {content}
      </Stack>
    </Card>
  );
}
