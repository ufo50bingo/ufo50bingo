import { useEffect, useState } from "react";
import Duration from "./Duration";

type Props = {
  curStartTime: number;
  accumulatedDuration: number;
  showDecimal?: boolean;
};

export default function RunningDuration({
  curStartTime,
  accumulatedDuration,
  showDecimal,
}: Props) {
  const [_dummyState, setDummyState] = useState(0);
  useEffect(() => {
    const interval = setInterval(
      () => setDummyState((prevDummyState) => prevDummyState + 1),
      100
    );
    return () => clearInterval(interval);
  }, []);
  return (
    <Duration
      // eslint-disable-next-line react-hooks/purity
      duration={accumulatedDuration + Date.now() - curStartTime}
      showDecimal={showDecimal}
    />
  );
}
