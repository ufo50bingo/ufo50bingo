import { useEffect, useState } from 'react';
import Duration from './Duration';

type Props = {
  curStartTime: number;
  accumulatedDuration: number;
};

export default function RunningDuration({ curStartTime, accumulatedDuration }: Props) {
  const [dummyState, setDummyState] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setDummyState((prevDummyState) => prevDummyState + 1), 100);
    return () => clearInterval(interval);
  }, []);
  return <Duration duration={accumulatedDuration + Date.now() - curStartTime} />;
}
