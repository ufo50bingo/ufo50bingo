import Duration from "@/app/practice/Duration";
import { useEffect, useState } from "react";

type Props = {
  curStartTime: number;
  accumulatedDuration: number;
};

export default function RunningTimer({
  curStartTime,
  accumulatedDuration,
}: Props) {
  // eslint-disable-next-line react-hooks/purity
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 50);
    return () => clearInterval(interval);
  }, []);
  const duration = accumulatedDuration + Math.max(now - curStartTime, 0);
  if (duration >= 0 && duration < 5000) {
    return "START!";
  }
  return <Duration duration={duration} showDecimal={duration < 0} />;
}
