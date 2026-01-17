import { fetchBoard, fetchFeed, getSocketKey } from "@/app/fetchMatchInfo";
import { BingosyncColor, getBoard } from "@/app/matches/parseBingosyncData";
import CastWrapper from "./CastWrapper";
import getSupabaseClient from "./getSupabaseClient";
import { CountChangeRow, CountState, CurrentGame, CurrentGameRow } from "./useSyncedState";
import { RoomCookie, toBingosyncCookie } from "../roomCookie";
import getSeed from "../common/getSeed";

type Props = {
  id: string;
  roomCookie: RoomCookie;
};

export type GeneralCounts = { [goal: string]: CountState };

export default async function CastPage({ id, roomCookie }: Props) {
  const bingosyncCookie = toBingosyncCookie(roomCookie);
  const [
    rawBoard,
    rawFeed,
    socketKey,
    seed,
    rawGeneralCounts,
    colors,
    rawCurrentGames,
  ] = await Promise.all([
    fetchBoard(id),
    fetchFeed(id, bingosyncCookie),
    getSocketKey(id, bingosyncCookie),
    getSeed(id),
    getGeneralCounts(id),
    getColors(id),
    getCurrentGames(id),
  ]);
  const countsForSeed = rawGeneralCounts.filter((entry) => entry.seed === seed);
  const currentGamesForSeed = rawCurrentGames.filter(
    (entry) => entry.seed === seed
  );
  const allPlayerGames: Array<Array<CurrentGame>> = [];
  for (const entry of currentGamesForSeed) {
    const curGames = allPlayerGames[entry.player_num] ?? [];
    curGames.push({ game: entry.game, start_time: entry.start_time });
    allPlayerGames[entry.player_num] = curGames;
  }
  const structuredCounts = structureCounts(countsForSeed);
  const board = getBoard(rawBoard);
  return (
    <CastWrapper
      id={id}
      board={board}
      rawFeed={rawFeed}
      socketKey={socketKey}
      initialSeed={seed}
      initialCounts={structuredCounts}
      initialLeftColor={colors.left}
      initialRightColor={colors.right}
      initialAllPlayerGames={allPlayerGames}
      playerName={roomCookie.name}
    />
  );
}

async function getGeneralCounts(id: string): Promise<CountChangeRow[]> {
  const supabase = getSupabaseClient();
  const { data } = await supabase
    .from("general_count")
    .select()
    .eq("room_id", id);
  return data ?? [];
}

async function getColors(
  id: string
): Promise<{ left: BingosyncColor; right: BingosyncColor }> {
  const supabase = getSupabaseClient();
  const { data } = await supabase.from("color").select().eq("room_id", id);
  if (data == null) {
    return { left: "red", right: "red" };
  }
  const left = data.find((entry) => entry.is_left === true)?.color ?? "red";
  const right = data.find((entry) => entry.is_left === false)?.color ?? "red";
  return { left, right };
}

async function getCurrentGames(id: string): Promise<CurrentGameRow[]> {
  const supabase = getSupabaseClient();
  const { data } = await supabase
    .from("current_game")
    .select()
    .eq("room_id", id)
    .order("start_time", { ascending: false });
  return data ?? [];
}

function structureCounts(
  rawCounts: ReadonlyArray<CountChangeRow>
): GeneralCounts {
  const generals: GeneralCounts = {};
  rawCounts.forEach((rawCount) => {
    const goalState: CountState = generals[rawCount.goal] ?? {
      leftCounts: {},
      rightCounts: {},
    };
    const toUpdate = rawCount.is_left
      ? goalState.leftCounts
      : goalState.rightCounts;
    toUpdate[rawCount.game] = rawCount.count;
    goalState[rawCount.is_left ? "leftCounts" : "rightCounts"] = toUpdate;
    generals[rawCount.goal] = goalState;
  });
  return generals;
}
