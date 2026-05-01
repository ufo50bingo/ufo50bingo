import { ReactNode, useCallback, useMemo, useState } from "react";
import Duration from "@/app/practice/Duration";
import RunningDuration from "@/app/practice/RunningDuration";

type SyncedTimerEventName = "set_duration" | "pause" | "start";

type SyncedTimerEvent = {
  id: number;
  room_id: string;
  seed: number;
  time: number;
  event: SyncedTimerEventName;
  duration: null | undefined | number;
};

type Input = {
  id: string;
  seed: number;
  initialEvents: ReadonlyArray<SyncedTimerEvent>;
};

type Running = {
  type: "running";
  startTime: number;
  accumulatedDuration: number;
};

type Paused = {
  type: "paused" | "not_started";
  accumulatedDuration: number;
};

type TimerState = Running | Paused;

type Return = {
  timer: ReactNode;
  addEvent: (newEvent: SyncedTimerEvent) => void;
};

export default function useSyncedTimer({
  id,
  seed,
  initialEvents,
}: Input): Return {
  const [events, setEvents] =
    useState<ReadonlyArray<SyncedTimerEvent>>(initialEvents);
  const timerState = useMemo<TimerState>(() => {
    let accumulatedDuration = -60000;
    let curStartTime: null | number = null;
    let hasStarted = false;

    events.forEach((item) => {
      switch (item.event) {
        case "set_duration":
          accumulatedDuration = item.duration!;
          if (curStartTime != null) {
            curStartTime = item.time;
          }
          return;
        case "pause":
          if (curStartTime != null) {
            accumulatedDuration += item.time - curStartTime;
            curStartTime = null;
          }
          return;
        case "start":
          hasStarted = true;
          if (curStartTime == null) {
            curStartTime = item.time;
          }
          return;
        default:
          item.event satisfies never;
          return;
      }
    });
    return curStartTime == null
      ? { type: hasStarted ? "paused" : "not_started", accumulatedDuration }
      : { type: "running", startTime: curStartTime ?? 0, accumulatedDuration };
  }, [events]);

  const timer =
    state.curStartTime != null ? (
      <RunningDuration
        curStartTime={state.curStartTime}
        accumulatedDuration={state.accumulatedDuration}
        showDecimal={false}
      />
    ) : (
      <Duration showDecimal={false} duration={state.accumulatedDuration} />
    );

  return {
    timer,
    addEvent,
  };
}
