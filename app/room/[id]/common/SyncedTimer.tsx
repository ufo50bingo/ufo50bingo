import Duration from "@/app/practice/Duration";
import RunningTimer from "./RunningTimer";
import { SyncedTimerState } from "./useSyncedTimer";

type Props = {
  timerState: SyncedTimerState;
};

export default function SyncedTimer({ timerState }: Props) {
  return timerState.type === "running" ? (
    <RunningTimer
      curStartTime={timerState.startTime}
      accumulatedDuration={timerState.accumulatedDuration}
    />
  ) : (
    <Duration
      showDecimal={timerState.accumulatedDuration < 0}
      duration={timerState.accumulatedDuration}
    />
  );
}
