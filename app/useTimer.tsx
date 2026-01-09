import { ReactNode, useState } from "react";
import RunningDuration from "./practice/RunningDuration";
import Duration from "./practice/Duration";

// uses MILLISECONDS
type Input = {
  durationMS: number;
  isRunning: boolean;
};

type Return = {
  isRunning: boolean;
  getDurationMS: () => number;
  timer: ReactNode;
  start: () => void;
  pause: () => void;
  reset: (input?: Input) => void;
};

export default function useTimer(input?: Input): Return {
  // eslint-disable-next-line react-hooks/purity
  const [curStartTime, setCurStartTime] = useState(Date.now());
  const [accumulatedDuration, setAccumulatedDuration] = useState(
    input?.durationMS ?? 0
  );

  const [isRunning, setIsRunning] = useState(input?.isRunning ?? false);

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

  const reset = (input?: Input) => {
    setCurStartTime(Date.now());
    setAccumulatedDuration(input?.durationMS ?? 0);
    setIsRunning(input?.isRunning ?? false);
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
