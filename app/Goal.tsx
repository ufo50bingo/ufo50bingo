'use client';

import { useRef, useState } from 'react';
import {
  IconArrowForward,
  IconCircleCheck,
  IconPlayerPause,
  IconPlayerPlay,
  IconReload,
} from '@tabler/icons-react';
import { Button, Card, Stack, Text } from '@mantine/core';
import { db } from './db';
import Duration from './Duration';
import RunningDuration from './RunningDuration';

enum State {
  NOT_STARTED,
  RUNNING,
  PAUSED,
  DONE,
}

type Props = { goal: string; onNext: () => any };

export default function Goal({ goal, onNext }: Props) {
  const [dummyState, setDummyState] = useState(0);

  const [curStartTime, setCurStartTime] = useState(0);
  const [firstStartTime, setFirstStartTime] = useState(0);
  const [accumulatedDuration, setAccumulatedDuration] = useState(0);

  const [state, setState] = useState(State.NOT_STARTED);

  const startTimer = () => {
    setCurStartTime(Date.now());
    setState(State.RUNNING);
  };

  const pauseOrEndTimer = () => {
    setAccumulatedDuration(
      (prevAccumulatedDuration) => prevAccumulatedDuration + Date.now() - curStartTime
    );
  };

  const doneButton = (
    <Button
      leftSection={<IconCircleCheck />}
      color="green"
      onClick={() => {
        if (state === State.RUNNING) {
          pauseOrEndTimer();
        }
        setState(State.DONE);
        const duration =
          state === State.RUNNING
            ? accumulatedDuration + Date.now() - curStartTime
            : accumulatedDuration;
        const newRow = {
          goal,
          startTime: firstStartTime,
          duration,
        };
        db.attempts.add(newRow);
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
          <Text>
            <RunningDuration
              accumulatedDuration={accumulatedDuration}
              curStartTime={curStartTime}
            />
          </Text>
          <Button
            leftSection={<IconPlayerPause />}
            onClick={() => {
              pauseOrEndTimer();
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
          <Text>
            <Duration duration={accumulatedDuration} />
          </Text>
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
          <Text>
            <Duration duration={accumulatedDuration} />
          </Text>
          <Button
            leftSection={<IconReload />}
            onClick={() => {
              setAccumulatedDuration(0);
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

  return (
    <Card shadow="sm" padding="sm" radius="md" withBorder>
      <Stack gap={8}>
        <Text>
          <strong>{goal}</strong>
        </Text>
        {content}
      </Stack>
    </Card>
  );
}
