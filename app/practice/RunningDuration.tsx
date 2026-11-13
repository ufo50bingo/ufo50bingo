import { useEffect, useState } from "react";
import Duration from "./Duration";

type Props = {
  curStartTime: number;
  accumulatedDuration: number;
  showDecimal?: boolean;
  minDuration?: number;
};

export default function RunningDuration({
  curStartTime,
  accumulatedDuration,
  showDecimal,
  minDuration,
}: Props) {
  const [_dummyState, setDummyState] = useState(0);
  useEffect(() => {
    const interval = setInterval(
      () => setDummyState((prevDummyState) => prevDummyState + 1),
      100,
    );
    return () => clearInterval(interval);
  }, []);
  // eslint-disable-next-line react-hooks/purity
  const actualDuration = accumulatedDuration + Date.now() - curStartTime;
  return (
    <Duration
      duration={
        minDuration != null
          ? Math.max(minDuration, actualDuration)
          : actualDuration
      }
      showDecimal={showDecimal}
    />
  );
}
