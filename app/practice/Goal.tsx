"use client";

import { useState } from "react";
import {
  IconArrowForward,
  IconCircleCheck,
  IconPlayerPause,
  IconPlayerPlay,
  IconReload,
} from "@tabler/icons-react";
import { Badge, Button, Card, Group, Stack, Text } from "@mantine/core";
import { db } from "../db";
import { DIFFICULTY_NAMES, SORTED_FLAT_GOALS } from "../goals";
import useTimer from "../useTimer";

enum State {
  NOT_STARTED,
  RUNNING,
  PAUSED,
  DONE,
}

type Props = { goal: string; onNext: () => void };

export default function Goal({ goal, onNext }: Props) {
  const { start, pause, reset, timer, getDurationMS } = useTimer();
  const [firstStartTime, setFirstStartTime] = useState(0);

  const [state, setState] = useState(State.NOT_STARTED);

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

  let content;
  switch (state) {
    case State.NOT_STARTED:
      content = (
        <>
          {newGoalButton}
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
          {newGoalButton}
        </>
      );
      break;
  }

  const difficulty = SORTED_FLAT_GOALS.find((g) => g.name === goal)?.types?.[1];

  return (
    <Card shadow="sm" padding="sm" radius="md" withBorder>
      <Stack gap={8}>
        <Group justify="space-between">
          <Text>
            <strong>{goal}</strong>
          </Text>
          {difficulty != null && (
            <Badge color="cyan" size="sm">
              {DIFFICULTY_NAMES[difficulty]}
            </Badge>
          )}
        </Group>
        {content}
      </Stack>
    </Card>
  );
}
