import Duration from "@/app/practice/Duration";
import { useEffect, useState } from "react";

type Props = {
  curEndTime: number;
  matchTime: number;
};

export default function RunningMatchTime({ curEndTime, matchTime }: Props) {
  const [_dummyState, setDummyState] = useState(0);
  useEffect(() => {
    const interval = setInterval(
      () => setDummyState((prevDummyState) => prevDummyState + 1),
      100
    );
    return () => clearInterval(interval);
  }, []);
  const totalRemaining = curEndTime - Date.now();
  const timeToDisplay =
    totalRemaining > matchTime ? totalRemaining - matchTime : totalRemaining;
  return <Duration duration={timeToDisplay} showDecimal={false} />;
}
