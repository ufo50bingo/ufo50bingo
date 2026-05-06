import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import getSupabaseClient from "../cast/getSupabaseClient";
import { useServerOffsetContext } from "../ServerOffsetContext";
import { SoundChoices } from "./NotificationsSection";
import useLocalNumber from "@/app/localStorage/useLocalNumber";
import revealBoard from "../play/revealBoard";

type SyncedTimerEventName = "set_duration" | "pause" | "start";

interface SyncedTimerEvent {
  time: number;
  event: SyncedTimerEventName;
  duration: null | undefined | number;
  player_name?: null | undefined | string;
}

interface SyncedTimerEventFromBroadcast extends SyncedTimerEvent {
  seed: number;
}

export interface FullSyncedTimerEvent extends SyncedTimerEventFromBroadcast {
  room_id: string;
}

type Input = {
  id: string;
  seed: number;
  initialEvents: ReadonlyArray<SyncedTimerEvent>;
  playAudio: (soundType: keyof SoundChoices) => void;
  isCast: boolean;
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
  addEvent: (newEvent: FullSyncedTimerEvent) => Promise<void>;
  timerState: SyncedTimerState;
  forceReveal: () => void;
};

export default function useSyncedTimer({
  id,
  seed,
  initialEvents,
  playAudio,
  isCast,
}: Input): Return {
  const [events, setEvents] =
    useState<ReadonlyArray<SyncedTimerEvent>>(initialEvents);

  const supabase = getSupabaseClient();

  const [lastForceReveal, setLastForceReveal] = useLocalNumber({
    key: `last-force-reveal-${id}-${seed}`,
    defaultValue: 0,
  });

  const forceReveal = useCallback(
    async () => {
      setLastForceReveal(Date.now());
      await revealBoard(id);
    },
    [setLastForceReveal],
  );

  const { getClientMsFromServerMs } = useServerOffsetContext();

  const [now, setNow] = useState(() => Date.now());

  const timerState = useMemo<SyncedTimerState>(() => {
    let accumulatedDuration = -60000;
    let curStartTime: null | number = null;
    let hasStarted = false;
    let pauseRequester: null | undefined | string = null;
    let lastPauseTime: null | number = null;

    events.forEach((item) => {
      switch (item.event) {
        case "set_duration":
          accumulatedDuration = item.duration!;
          if (curStartTime != null) {
            curStartTime = item.time;
          }
          return;
        case "pause":
          if (curStartTime != null) {
            accumulatedDuration += item.time - curStartTime;
            curStartTime = null;
          }
          pauseRequester = item.player_name;
          lastPauseTime = item.time;
          return;
        case "start":
          hasStarted = true;
          if (curStartTime == null) {
            curStartTime = item.time;
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
      : curStartTime < Date.now()
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
  }, [events, getClientMsFromServerMs, lastForceReveal, now]);

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
  const isBeforeReveal = timerState.type === "not_started" || (timerState.type === "countdown" && !timerState.wasPaused);
  useEffect(() => {
    const prevIsBeforeReveal = prevIsBeforeRevealRef.current;
    if (
      !isCast && prevIsBeforeReveal && !isBeforeReveal
    ) {
      revealBoard(id);
    }
    prevIsBeforeRevealRef.current = isBeforeReveal;
  }, [isBeforeReveal, isCast]);

  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const seedRef = useRef<number>(seed);
  if (seedRef.current !== seed) {
    setEvents([]);
    seedRef.current = seed;
  }
  const playAudioRef = useRef(playAudio);

  useEffect(() => {
    const newChannel = supabase.channel(`room:${id}:all_sync`, {
      config: { private: false },
    });

    newChannel
      .on(
        "broadcast",
        { event: "add_timer_event" },
        (payload: { payload: SyncedTimerEventFromBroadcast }) => {
          const event = payload.payload;
          if (seedRef.current === event.seed) {
            {
              setEvents((prevEvents) =>
                [...prevEvents, event].toSorted((a, b) => a.time - b.time),
              );
              if (event.event === "pause") {
                playAudioRef.current("pause");
              }
            }
          }
        },
      )
      .subscribe();

    channelRef.current = newChannel;

    return () => {
      supabase.removeChannel(newChannel);
      channelRef.current = null;
    };
  }, [id, supabase]);

  const addEvent = useCallback(
    async (newEvent: FullSyncedTimerEvent) => {
      setEvents((prevEvents) =>
        [...prevEvents, newEvent].toSorted((a, b) => a.time - b.time),
      );
      if (channelRef.current != null) {
        channelRef.current.send({
          type: "broadcast",
          event: "add_timer_event",
          payload: newEvent,
        });
      }
      await supabase.from("timer_event").upsert(newEvent);
    },
    [supabase],
  );

  return {
    addEvent,
    timerState,
    forceReveal,
  };
}
