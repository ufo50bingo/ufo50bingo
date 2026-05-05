import {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Duration from "@/app/practice/Duration";
import getSupabaseClient from "../cast/getSupabaseClient";
import { useServerOffsetContext } from "../ServerOffsetContext";
import RunningBoardCover from "./RunningBoardCover";
import revealBoard from "../play/revealBoard";
import RunningTimer from "./RunningTimer";
import { SoundChoices } from "./NotificationsSection";
import useLocalNumber from "@/app/localStorage/useLocalNumber";

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

type TimerState = Running | Paused | NotStarted | Countdown;

type Return = {
  timer: ReactNode;
  boardCover: ReactNode;
  isRevealed: boolean;
  addEvent: (newEvent: FullSyncedTimerEvent) => Promise<void>;
  timerState: TimerState;
  forceReveal: () => void;
};

export default function useSyncedTimer({
  id,
  seed,
  initialEvents,
  playAudio,
}: Input): Return {
  const [events, setEvents] =
    useState<ReadonlyArray<SyncedTimerEvent>>(initialEvents);

  const supabase = getSupabaseClient();

  const [lastForceReveal, setLastForceReveal] = useLocalNumber({
    key: `last-force-reveal-${id}`,
    defaultValue: 0,
  });

  const forceReveal = useCallback(
    () => setLastForceReveal(Date.now()),
    [setLastForceReveal],
  );

  const { getClientMsFromServerMs } = useServerOffsetContext();

  const [now, setNow] = useState(() => Date.now());

  const timerState = useMemo<TimerState>(() => {
    // TODO: Fix
    let accumulatedDuration = -6000;
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
      : curStartTime < now
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
          };
  }, [events, getClientMsFromServerMs, lastForceReveal, now]);

  useEffect(() => {
    if (timerState.type !== "countdown") {
      return;
    }

    const delay = timerState.endTime - Date.now();
    if (delay <= 0) {
      return;
    }

    const timeoutId = setTimeout(() => {
      setNow(Date.now());
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [timerState]);

  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const seedRef = useRef<number>(seed);
  // eslint-disable-next-line react-hooks/refs
  if (seedRef.current !== seed) {
    setEvents([]);
    // eslint-disable-next-line react-hooks/refs
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
                setIsRevealedWhenRunning(false);
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

  const timer =
    timerState.type === "running" ? (
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

  const onReveal = useCallback(async () => {
    setIsRevealedWhenRunning(true);
    await revealBoard(id);
  }, [id]);

  const boardCover =
    timerState.type === "not_started" ? (
      <>
        The board will be revealed automatically
        <br />
        when a countdown is started.
      </>
    ) : timerState.type === "running" ? (
      <RunningBoardCover
        curStartTime={timerState.startTime}
        onReveal={onReveal}
      />
    ) : (
      <>
        Pause requested
        {timerState.pauseRequester != null && (
          <> by {timerState.pauseRequester}</>
        )}
        !<br />
        Please pause your game and coordinate in chat.
        <br />
        <br />
        The board will be revealed automatically
        <br />
        when a countdown is started.
      </>
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
      if (newEvent.event === "pause") {
        setIsRevealedWhenRunning(false);
      }
      await supabase.from("timer_event").upsert(newEvent);
    },
    [supabase],
  );

  return {
    timer,
    boardCover,
    isRevealed: timerState.type === "running" && isRevealedWhenRunning,
    addEvent,
    timerState,
    forceReveal,
  };
}
