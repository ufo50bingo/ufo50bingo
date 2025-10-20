import { ReactNode, useCallback, useState } from "react";
import RunningMatchTime from "./RunningMatchTime";
import Duration from "@/app/practice/Duration";

// uses MILLISECONDS
type Input = {
  key: string;
  scanMs: number;
  matchMs: number;
};

type TimerState = RunningState | PausedState;

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

  const setState = useCallback(
    (newState: TimerState) => {
      setStateRaw(newState);
      if (global.window == undefined || localStorage == null) {
        return;
      }
      localStorage.setItem(timerKey, JSON.stringify(newState));
    },
    [timerKey]
  );

  const start = () => {
    if (state.type === "paused") {
      setState({
        type: "running",
        scanMs,
        matchMs,
        endTime: Date.now() + state.remainingMs,
      });
    }
  };

  const pause = () => {
    if (state.type === "running") {
      setState({
        type: "paused",
        scanMs,
        matchMs,
        remainingMs: state.endTime - Date.now(),
      });
    }
  };

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
  };
}
