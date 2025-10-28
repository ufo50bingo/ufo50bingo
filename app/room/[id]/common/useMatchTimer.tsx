import { ReactNode, useState } from "react";
import RunningMatchTime from "./RunningMatchTime";
import Duration from "@/app/practice/Duration";

// uses MILLISECONDS
type Input = {
  key: string;
  scanTime: number;
  matchTime: number;
};

type Return = {
  timer: ReactNode;
  start: () => void;
  pause: () => void;
};

export default function useMatchTimer(input: Input): Return {
  const [remainingMs, setRemainingMs] = useState(input.scanTime + input.matchTime);
  const [curEndTime, setCurEndTime] = useState<null | number>(null);

  const start = () => {
    setCurEndTime(Date.now() + remainingMs);
  };

  const pause = () => {
    if (curEndTime != null) {
      setRemainingMs(
        Math.max(curEndTime - Date.now(), 0)
      );
      setCurEndTime(null);
    }
  };

  const timer = curEndTime != null ? (
    <RunningMatchTime
      curEndTime={curEndTime}
      matchTime={input.matchTime}
    />
  ) : (
    <Duration showDecimal={false} duration={remainingMs > input.matchTime ? remainingMs - input.matchTime : remainingMs} />
  );

  return {
    start,
    pause,
    timer,
  };
}
