import { ReactNode, useCallback, useState } from "react";
import RunningMatchTime from "./RunningMatchTime";
import Duration from "@/app/practice/Duration";

// uses MILLISECONDS
type Input = {
  key: string;
  scanMs: number;
  matchMs: number;
};

export type TimerState = RunningState | PausedState;

interface BaseState {
  scanMs: number;
  matchMs: number;
}

interface RunningState extends BaseState {
  type: "running";
  endTime: number;
}

interface PausedState extends BaseState {
  type: "paused";
  remainingMs: number;
}

type Return = {
  timer: ReactNode;
  start: () => void;
  pause: () => void;
  setState: (newState: TimerState) => void;
  state: TimerState;
};

export default function useMatchTimer({ key, scanMs, matchMs }: Input): Return {
  const timerKey = "timer-" + key;
  const [state, setStateRaw] = useState<TimerState>(() => {
    const defaultState: PausedState = {
      type: "paused",
      remainingMs: scanMs + matchMs,
      scanMs,
      matchMs,
    };
    if (global.window == undefined || localStorage == null) {
      return defaultState;
    }
    const fromStorage = localStorage.getItem(timerKey);
    if (fromStorage == null || fromStorage === "") {
      return defaultState;
    }
    return JSON.parse(fromStorage);
  });

  const saveStateToLocalStorage = useCallback(
    (newState: TimerState) => {
      if (global.window == undefined || localStorage == null) {
        return;
      }
      localStorage.setItem(timerKey, JSON.stringify(newState));
    },
    [timerKey]
  );

  const setState = useCallback(
    (newState: TimerState) => {
      setStateRaw(newState);
      saveStateToLocalStorage(newState);
    },
    [saveStateToLocalStorage]
  );

  const start = useCallback(
    () =>
      setStateRaw((prevState: TimerState) => {
        const newState: TimerState =
          prevState.type === "paused"
            ? {
                type: "running",
                scanMs: prevState.scanMs,
                matchMs: prevState.matchMs,
                endTime: Date.now() + prevState.remainingMs,
              }
            : prevState;
        saveStateToLocalStorage(newState);
        return newState;
      }),
    [saveStateToLocalStorage]
  );

  const pause = useCallback(
    () =>
      setStateRaw((prevState: TimerState) => {
        const newState: TimerState =
          prevState.type === "running"
            ? {
                type: "paused",
                scanMs: prevState.scanMs,
                matchMs: prevState.matchMs,
                remainingMs: prevState.endTime - Date.now(),
              }
            : prevState;
        saveStateToLocalStorage(newState);
        return newState;
      }),
    [saveStateToLocalStorage]
  );

  const timer =
    state.type === "running" ? (
      <RunningMatchTime curEndTime={state.endTime} matchTime={state.matchMs} />
    ) : (
      <Duration
        showDecimal={false}
        duration={
          state.remainingMs > state.matchMs
            ? state.remainingMs - state.matchMs
            : state.remainingMs
        }
      />
    );

  return {
    start,
    pause,
    timer,
    setState,
    state,
  };
}
