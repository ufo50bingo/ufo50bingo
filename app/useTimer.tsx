import { ReactNode, useState } from "react";
import RunningDuration from "./practice/RunningDuration";
import Duration from "./practice/Duration";

type Return = {
  isRunning: boolean;
  getDurationMS: () => number;
  timer: ReactNode;
  start: () => void;
  pause: () => void;
  reset: () => void;
};

export default function useTimer(): Return {
  const [curStartTime, setCurStartTime] = useState(0);
  const [accumulatedDuration, setAccumulatedDuration] = useState(0);

  const [isRunning, setIsRunning] = useState(false);

  const getDurationMS = () =>
    isRunning
      ? accumulatedDuration + Date.now() - curStartTime
      : accumulatedDuration;

  const start = () => {
    setCurStartTime(Date.now());
    setIsRunning(true);
  };

  const pause = () => {
    if (isRunning) {
      setAccumulatedDuration(
        (prevAccumulatedDuration) =>
          prevAccumulatedDuration + Date.now() - curStartTime
      );
      setIsRunning(false);
    }
  };

  const reset = () => {
    setCurStartTime(0);
    setAccumulatedDuration(0);
    setIsRunning(false);
  };

  return {
    isRunning,
    getDurationMS,
    start,
    pause,
    reset,
    timer: isRunning ? (
      <RunningDuration
        curStartTime={curStartTime}
        accumulatedDuration={accumulatedDuration}
      />
    ) : (
      <Duration duration={accumulatedDuration} />
    ),
  };
}
