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
import { CountChange } from "../cast/useSyncedState";
import { useServerOffsetContext } from "../ServerOffsetContext";

type SyncedTimerEventName = "set_duration" | "pause" | "start";

type SyncedTimerEvent = {
  id: number;
  room_id: string;
  seed: number;
  time: number;
  event: SyncedTimerEventName;
  duration: null | undefined | number;
};

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
  addEvent: (newEvent: SyncedTimerEvent) => void;
};

export default function useSyncedTimer({
  id,
  seed,
  initialEvents,
}: Input): Return {
  const [events, setEvents] =
    useState<ReadonlyArray<SyncedTimerEvent>>(initialEvents);
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
      : { type: "running", startTime: curStartTime ?? 0, accumulatedDuration };
  }, [events]);

  const supabase = getSupabaseClient();

  const { getServerMsFromClientMs } = useServerOffsetContext();

  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const setGeneralGameCountRef = useRef<
    null | ((change: CountChange, shouldBroadcast: boolean) => unknown)
  >(null);
  const seedRef = useRef<number>(seed);
  // eslint-disable-next-line react-hooks/refs
  if (seedRef.current !== seed) {
    setEvents([]);
    // eslint-disable-next-line react-hooks/refs
    seedRef.current = seed;
  }

  useEffect(() => {
    const newChannel = supabase.channel(`room:${id}:sync`, {
      config: { private: false },
    });

    newChannel
      .on(
        "broadcast",
        { event: "change_count" },
        (payload: { payload: CountChangeSync }) => {
          const change = payload.payload;
          if (
            setGeneralGameCountRef.current != null &&
            seedRef.current === change.seed
          ) {
            setGeneralGameCountRef.current(change, false);
          }
        },
      )
      .on(
        "broadcast",
        { event: "change_color" },
        (payload: { payload: ColorChangeSync }) => {
          const change = payload.payload;
          if (change.is_left) {
            setLeftColorRaw(change.color);
          } else {
            setRightColorRaw(change.color);
          }
        },
      )
      .on(
        "broadcast",
        { event: "add_game" },
        (payload: { payload: CurrentGameSync }) => {
          const change = payload.payload;
          setAllPlayerGames((oldAllPlayerGames) =>
            updateAllPlayerGames(
              oldAllPlayerGames,
              { game: change.game, start_time: change.start_time },
              change.player_num,
            ),
          );
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
    state.curStartTime != null ? (
      <RunningDuration
        curStartTime={state.curStartTime}
        accumulatedDuration={state.accumulatedDuration}
        showDecimal={false}
      />
    ) : (
      <Duration showDecimal={false} duration={state.accumulatedDuration} />
    );

  return {
    timer,
    addEvent,
  };
}
