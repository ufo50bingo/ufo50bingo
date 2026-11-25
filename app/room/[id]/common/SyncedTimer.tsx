import Duration from "@/app/practice/Duration";
import RunningTimer from "./RunningTimer";
import { SyncedTimerState } from "./useSyncedTimer";

type Props = {
  timerState: SyncedTimerState;
  showStart?: boolean;
};

export default function SyncedTimer({ timerState, showStart = true }: Props) {
  return timerState.type === "running" ? (
    <RunningTimer
      curStartTime={timerState.startTime}
      accumulatedDuration={timerState.accumulatedDuration}
      showStart={showStart}
    />
  ) : (
    <Duration
      showDecimal={timerState.accumulatedDuration < 0}
      duration={timerState.accumulatedDuration}
    />
  );
}
