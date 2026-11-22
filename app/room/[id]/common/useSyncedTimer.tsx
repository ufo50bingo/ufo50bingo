import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useServerOffsetContext } from "../ServerOffsetContext";
import { SoundChoices } from "./NotificationsSection";
import useLocalNumber from "@/app/localStorage/useLocalNumber";
import { NewFeed } from "@/app/fetchFeed";
import { GameMembers } from "./useMembers";
export type SyncedTimerEventName = "set_duration" | "pause" | "start";

interface SyncedTimerEvent {
  time: number;
  event: SyncedTimerEventName;
  duration: null | undefined | number;
  player_name?: null | undefined | string;
}

interface SyncedTimerEventFromBroadcast extends SyncedTimerEvent {
  seed: number;
}

// TODO: Remove this
export interface FullSyncedTimerEvent extends SyncedTimerEventFromBroadcast {
  room_id: string;
}

type Input = {
  gameId: number;
  feed: NewFeed;
  playAudio: (soundType: keyof SoundChoices) => void;
  isCast: boolean;
  members: GameMembers;
};

interface TimerStateBase {
  accumulatedDuration: number;
}

interface NotRunningBase extends TimerStateBase {
  isForceRevealed: boolean;
}

interface Countdown extends NotRunningBase {
  type: "countdown";
  endTime: number;
  wasPaused: boolean;
}

interface Paused extends NotRunningBase {
  type: "paused";
  pauseRequester: null | undefined | string;
}

interface NotStarted extends NotRunningBase {
  type: "not_started";
}

interface Running extends TimerStateBase {
  type: "running";
  startTime: number;
}

export type SyncedTimerState = Running | Paused | NotStarted | Countdown;

type Return = {
  timerState: SyncedTimerState;
  forceReveal: () => void;
};

export default function useSyncedTimer({
  gameId,
  feed,
  isCast,
  members,
}: Input): Return {
  const [lastForceReveal, setLastForceReveal] = useLocalNumber({
    key: `last-force-reveal-${gameId}`,
    defaultValue: 0,
  });

  const forceReveal = useCallback(async () => {
    setLastForceReveal(Date.now());
    // TODO: Sync reveal info
    // await revealBoard(id, roomBackend);
  }, [setLastForceReveal]);

  const { getClientMsFromServerMs } = useServerOffsetContext();

  const [now, setNow] = useState(() => Date.now());

  const timerState = useMemo<SyncedTimerState>(() => {
    let accumulatedDuration = -60000;
    let curStartTime: null | number = null;
    let hasStarted = false;
    let pauseRequester: null | undefined | string = null;
    let lastPauseTime: null | number = null;

    feed.forEach((item) => {
      if (item.type !== "timer_event") {
        return;
      }
      switch (item.event) {
        case "set_duration":
          accumulatedDuration = item.duration! * 1000;
          if (curStartTime != null) {
            curStartTime = item.time * 1000;
          }
          return;
        case "pause":
          if (curStartTime != null) {
            accumulatedDuration += item.time * 1000 - curStartTime;
            curStartTime = null;
          }
          pauseRequester =
            members.get(item.userId)?.name ?? String(item.userId);
          lastPauseTime = item.time * 1000;
          return;
        case "start":
          hasStarted = true;
          if (curStartTime == null) {
            curStartTime = item.time * 1000;
          }
          return;
        default:
          item.event satisfies never;
          return;
      }
    });
    const isForceRevealed =
      lastForceReveal > 0 &&
      (lastPauseTime == null ||
        getClientMsFromServerMs(lastPauseTime) < lastForceReveal);
    return curStartTime == null
      ? {
          type: hasStarted ? "paused" : "not_started",
          accumulatedDuration,
          pauseRequester: hasStarted ? pauseRequester : undefined,
          isForceRevealed,
        }
      : getClientMsFromServerMs(curStartTime) < Date.now()
        ? {
            type: "running",
            startTime: getClientMsFromServerMs(curStartTime),
            accumulatedDuration,
            isForceRevealed,
          }
        : {
            type: "countdown",
            endTime: getClientMsFromServerMs(curStartTime),
            accumulatedDuration,
            isForceRevealed,
            wasPaused: lastPauseTime != null,
          };
    // including `now` to force it to re-run to change from countdown to running
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feed, members, getClientMsFromServerMs, lastForceReveal, now]);

  useEffect(() => {
    if (timerState.type !== "countdown") {
      return;
    }

    const delay = timerState.endTime - Date.now();

    const timeoutId = setTimeout(
      async () => {
        setNow(Date.now());
      },
      Math.max(delay, 0),
    );

    return () => clearTimeout(timeoutId);
  }, [timerState]);

  const prevIsBeforeRevealRef = useRef<null | boolean>(null);
  const isBeforeReveal =
    timerState.type === "not_started" ||
    (timerState.type === "countdown" && !timerState.wasPaused);
  useEffect(() => {
    const prevIsBeforeReveal = prevIsBeforeRevealRef.current;
    if (!isCast && prevIsBeforeReveal && !isBeforeReveal) {
      // TOOD: Reveal board
      // revealBoard(id, roomBackend);
    }
    prevIsBeforeRevealRef.current = isBeforeReveal;
  }, [isBeforeReveal, isCast]);

  return {
    timerState,
    forceReveal,
  };
}
