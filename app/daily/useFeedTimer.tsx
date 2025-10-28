import { ReactNode, useMemo, useState } from "react";
import { DailyFeedRow, db } from "../db";
import RunningDuration from "../practice/RunningDuration";
import Duration from "../practice/Duration";

type Return = {
  isRunning: boolean;
  timer: ReactNode;
  unpause: () => void;
  pause: () => void;
};

type Running = {
  type: 'running',
  startTime: number,
  accumulatedDuration: number,
};

type Paused = {
  type: 'paused',
  accumulatedDuration: number,
}

type TimerState = Running | Paused;

export default function useFeedTimer(
  feed: ReadonlyArray<DailyFeedRow>,
  date: string,
  attempt: number,
): Return {
  const timerState = useMemo<TimerState>(() => {
    let accumulatedDuration = -60000;
    let curStartTime: null | number = null;

    feed.forEach((item: DailyFeedRow) => {
      switch (item.type) {
        case "clear":
        case "mark":
          return;
        case "reveal":
        case "unpause":
          if (curStartTime == null) {
            curStartTime = item.time;
          }
          return;
        case "pause":
          if (curStartTime != null) {
            accumulatedDuration += item.time - curStartTime;
            curStartTime = null;
          }
          return;
      }
    });
    return curStartTime == null
      ? { type: "paused", accumulatedDuration }
      : { type: "running", startTime: curStartTime ?? 0, accumulatedDuration };
  }, [feed]);

  const unpause = async () => {
    if (timerState.type === "paused") {
      await db.dailyFeed.add({ type: "unpause", time: Date.now(), date, attempt, squareIndex: null });
    }
  };

  const pause = async () => {
    if (timerState.type === "running") {
      await db.dailyFeed.add({ type: "pause", time: Date.now(), date, attempt, squareIndex: null });
    }
  };

  return {
    isRunning: timerState.type === "running",
    unpause,
    pause,
    timer: timerState.type === "running" ? (
      <RunningDuration
        curStartTime={timerState.startTime}
        accumulatedDuration={timerState.accumulatedDuration}
      />
    ) : (
      <Duration duration={timerState.accumulatedDuration} />
    ),
  };
}
