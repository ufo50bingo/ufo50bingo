import {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Duration from "@/app/practice/Duration";
import RunningDuration from "@/app/practice/RunningDuration";
import getSupabaseClient from "../cast/getSupabaseClient";
import { useServerOffsetContext } from "../ServerOffsetContext";

type SyncedTimerEventName = "set_duration" | "pause" | "start";

interface SyncedTimerEvent {
  time: number;
  event: SyncedTimerEventName;
  duration: null | undefined | number;
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
};

type Running = {
  type: "running";
  startTime: number;
  accumulatedDuration: number;
};

type Paused = {
  type: "paused" | "not_started";
  accumulatedDuration: number;
};

type TimerState = Running | Paused;

type Return = {
  timer: ReactNode;
  addEvent: (newEvent: FullSyncedTimerEvent) => Promise<void>;
};

export default function useSyncedTimer({
  id,
  seed,
  initialEvents,
}: Input): Return {
  const [events, setEvents] =
    useState<ReadonlyArray<SyncedTimerEvent>>(initialEvents);

  const supabase = getSupabaseClient();

  const { getClientMsFromServerMs } = useServerOffsetContext();

  const timerState = useMemo<TimerState>(() => {
    let accumulatedDuration = -60000;
    let curStartTime: null | number = null;
    let hasStarted = false;

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
    return curStartTime == null
      ? { type: hasStarted ? "paused" : "not_started", accumulatedDuration }
      : {
          type: "running",
          startTime: getClientMsFromServerMs(curStartTime ?? 0),
          accumulatedDuration,
        };
  }, [events, getClientMsFromServerMs]);

  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const seedRef = useRef<number>(seed);
  // eslint-disable-next-line react-hooks/refs
  if (seedRef.current !== seed) {
    setEvents([]);
    // eslint-disable-next-line react-hooks/refs
    seedRef.current = seed;
  }

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
            setEvents((prevEvents) =>
              [...prevEvents, event].toSorted((a, b) => a.time - b.time),
            );
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

  const timer =
    timerState.type === "running" ? (
      <RunningDuration
        curStartTime={timerState.startTime}
        accumulatedDuration={timerState.accumulatedDuration}
        showDecimal={false}
      />
    ) : (
      <Duration showDecimal={false} duration={timerState.accumulatedDuration} />
    );

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
    timer,
    addEvent,
  };
}
