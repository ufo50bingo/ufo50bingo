import { Game, ProperGame } from "@/app/goals";
import { BingosyncColor } from "@/app/matches/parseBingosyncData";
import { useEffect, useMemo, useRef, useState } from "react";
import getSupabaseClient from "./getSupabaseClient";
import { GeneralCounts } from "./CastPage";
import getGamesForPlayer from "./getGamesForPlayer";

export interface CountState {
  leftCounts: { [game: string]: number };
  rightCounts: { [game: string]: number };
}

type Props = {
  id: string;
  seed: number;
  initialCounts: GeneralCounts;
  initialLeftColor: BingosyncColor;
  initialRightColor: BingosyncColor;
  initialAllPlayerGames: ReadonlyArray<ReadonlyArray<CurrentGame>>;
};

interface ColorChangeSync {
  is_left: boolean;
  color: BingosyncColor;
}

interface ColorChangeRow extends ColorChangeSync {
  room_id: string;
}

export interface CountChange {
  goal: string;
  is_left: boolean;
  game: Game;
  count: number;
}

interface CountChangeSync extends CountChange {
  seed: number;
}

export interface CountChangeRow extends CountChangeSync {
  room_id: string;
}

export interface CurrentGame {
  game: null | ProperGame;
  start_time: number;
}

interface CurrentGameSync extends CurrentGame {
  seed: number;
  player_num: number;
}

export interface CurrentGameRow extends CurrentGameSync {
  room_id: string;
}

export type SyncedState = {
  leftColor: BingosyncColor;
  rightColor: BingosyncColor;
  generals: GeneralCounts;
  allPlayerGames: ReadonlyArray<ReadonlyArray<CurrentGame>>;
  addGame: (newGame: null | ProperGame, playerNum: number) => unknown;
  setLeftColor: (newColor: BingosyncColor) => unknown;
  setRightColor: (newColor: BingosyncColor) => unknown;
  setGeneralGameCount: (change: CountChange) => unknown;
};

export default function useSyncedState({
  id,
  seed,
  initialCounts,
  initialLeftColor,
  initialRightColor,
  initialAllPlayerGames,
}: Props): SyncedState {
  const supabase = getSupabaseClient();

  const [leftColor, setLeftColorRaw] =
    useState<BingosyncColor>(initialLeftColor);
  const [rightColor, setRightColorRaw] =
    useState<BingosyncColor>(initialRightColor);
  const [generals, setGeneralsRaw] = useState<GeneralCounts>(initialCounts);
  const [allPlayerGames, setAllPlayerGames] = useState<ReadonlyArray<ReadonlyArray<CurrentGame>>>([]);

  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const setGeneralGameCountRef = useRef<
    null | ((change: CountChange, shouldBroadcast: boolean) => unknown)
  >(null);
  const seedRef = useRef<number>(seed);
  // eslint-disable-next-line react-hooks/refs
  if (seedRef.current !== seed) {
    setGeneralsRaw({});
    setAllPlayerGames([]);
    // eslint-disable-next-line react-hooks/refs
    seedRef.current = seed;
  }

  useEffect(() => {
    const newChannel = supabase.channel(`cast:${id}:sync`, {
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
        }
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
        }
      )
      .on(
        "broadcast",
        { event: "add_game" },
        (payload: { payload: CurrentGameSync }) => {
          const change = payload.payload;
          setAllPlayerGames(updateAllPlayerGames(
            allPlayerGames,
            { game: change.game, start_time: change.start_time },
            change.player_num,
          ));
        }
      )
      .subscribe();

    channelRef.current = newChannel;

    return () => {
      supabase.removeChannel(newChannel);
      channelRef.current = null;
    };
  }, [id, supabase]);

  return useMemo(() => {
    const syncColor = async (newColor: BingosyncColor, isLeft: boolean) => {
      const syncChange: ColorChangeSync = { is_left: isLeft, color: newColor };
      const rowChange: ColorChangeRow = { ...syncChange, room_id: id };
      if (channelRef.current != null) {
        channelRef.current.send({
          type: "broadcast",
          event: "change_color",
          payload: syncChange,
        });
      }
      await supabase.from("color").upsert(rowChange);
    };
    const setLeftColor = async (newColor: BingosyncColor) => {
      setLeftColorRaw(newColor);
      await syncColor(newColor, true);
    };
    const setRightColor = async (newColor: BingosyncColor) => {
      setRightColorRaw(newColor);
      await syncColor(newColor, false);
    };
    const addGame = async (newGame: null | ProperGame, playerNum: number) => {
      const newEntry: CurrentGame = {
        game: newGame,
        start_time: Date.now(),
      };
      setAllPlayerGames(updateAllPlayerGames(
        allPlayerGames,
        newEntry,
        playerNum,
      ));
      const syncChange: CurrentGameSync = { ...newEntry, player_num: playerNum, seed };
      const rowChange: CurrentGameRow = { ...syncChange, room_id: id };
      if (channelRef.current != null) {
        channelRef.current.send({
          type: "broadcast",
          event: "add_game",
          payload: syncChange,
        });
      }
      await supabase.from("current_game").insert(rowChange);
    };
    const setGeneralGameCount = async (
      change: CountChange,
      shouldBroadcast: boolean = true
    ) => {
      const leftCounts = generals[change.goal]?.leftCounts ?? {};
      const rightCounts = generals[change.goal]?.rightCounts ?? {};
      const newCounts = change.is_left ? { ...leftCounts } : { ...rightCounts };
      newCounts[change.game] = change.count;
      const newGeneralState = change.is_left
        ? {
          leftCounts: newCounts,
          rightCounts,
        }
        : {
          leftCounts,
          rightCounts: newCounts,
        };
      const newGenerals = {
        ...generals,
        [change.goal]: newGeneralState,
      };
      setGeneralsRaw(newGenerals);

      if (shouldBroadcast === true) {
        const syncChange: CountChangeSync = { ...change, seed };
        const rowChange: CountChangeRow = { ...syncChange, room_id: id };
        if (channelRef.current != null) {
          channelRef.current.send({
            type: "broadcast",
            event: "change_count",
            payload: syncChange,
          });
        }
        await supabase.from("general_count").upsert(rowChange);
      }
    };
    // eslint-disable-next-line react-hooks/refs
    setGeneralGameCountRef.current = setGeneralGameCount;

    return {
      generals,
      leftColor,
      rightColor,
      allPlayerGames,
      addGame,
      setLeftColor,
      setRightColor,
      setGeneralGameCount,
    };
  }, [
    leftColor,
    rightColor,
    allPlayerGames,
    generals,
    id,
    seed,
    supabase,
  ]);
}

function updateAllPlayerGames(
  allPlayerGames: ReadonlyArray<ReadonlyArray<CurrentGame>>,
  newGame: CurrentGame,
  playerNum: number
): ReadonlyArray<ReadonlyArray<CurrentGame>> {
  const oldGames = getGamesForPlayer(allPlayerGames, playerNum);
  const newGames = [...oldGames, newGame];
  const newAllPlayerGames = [...allPlayerGames];
  newAllPlayerGames[playerNum] = newGames;
  return newAllPlayerGames
}