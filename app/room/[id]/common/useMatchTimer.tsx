import { ReactNode, useCallback, useState } from "react";
import RunningMatchTime from "./RunningMatchTime";
import Duration from "@/app/practice/Duration";
import RunningDuration from "@/app/practice/RunningDuration";

// uses MILLISECONDS
type Input = {
  key: string;
  initialAccumulatedDuration: number;
};

export type TimerState = {
  accumulatedDuration: number;
  curStartTime: null | number;
}

type Return = {
  timer: ReactNode;
  start: () => void;
  pause: () => void;
  setState: (newState: TimerState) => void;
  state: TimerState;
};

export default function useMatchTimer({ key, initialAccumulatedDuration }: Input): Return {
  const timerKey = "timer_" + key;
  const [state, setStateRaw] = useState<TimerState>(() => {
    const defaultState: TimerState = {
      curStartTime: null,
      accumulatedDuration: initialAccumulatedDuration,
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
          prevState.curStartTime == null
            ? {
              accumulatedDuration: prevState.accumulatedDuration,
              curStartTime: Date.now(),
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
          prevState.curStartTime != null
            ? {
              curStartTime: null,
              accumulatedDuration: prevState.accumulatedDuration + Date.now() - prevState.curStartTime,
            }
            : prevState;
        saveStateToLocalStorage(newState);
        return newState;
      }),
    [saveStateToLocalStorage]
  );

  const timer =
    state.curStartTime != null ? (
      <RunningDuration
        curStartTime={state.curStartTime}
        accumulatedDuration={state.accumulatedDuration}
        showDecimal={false}
      />
    ) : (
      <Duration
        showDecimal={false}
        duration={state.accumulatedDuration}
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
