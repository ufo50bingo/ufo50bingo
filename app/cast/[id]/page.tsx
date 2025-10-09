import { fetchBoard, fetchFeed, getSocketKey } from "@/app/fetchMatchInfo";
import { BingosyncColor, getBoard } from "@/app/matches/parseBingosyncData";
import Login from "./Login";
import getCookie from "./getCookie";
import getSeed from "./getSeed";
import CastWrapper from "./CastWrapper";
import getSupabaseClient from "./getSupabaseClient";
import { CountChangeRow, CountState } from "./useSyncedState";
// import { STANDARD } from "@/app/pastas/standard";
// import getSrlV5Board from "@/app/practiceboard/getSrlV5Board";

type FilterParams = {
  use_bot: string;
};

export type GeneralCounts = { [goal: string]: CountState };

export default async function CastPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<FilterParams>;
}) {
  const useBot = (await searchParams)?.use_bot;
  const { id } = await params;

  const cookie = await getCookie(id, useBot === "true");
  if (cookie == null) {
    return <Login />;
  }
  const [rawBoard, rawFeed, socketKey, seed, rawGeneralCounts, colors] = await Promise.all([
    fetchBoard(id),
    fetchFeed(id, cookie),
    getSocketKey(id, cookie),
    getSeed(id),
    getGeneralCounts(id),
    getColors(id),
  ]);
  const countsForSeed = rawGeneralCounts.filter(entry => entry.seed === seed);
  const structuredCounts = structureCounts(countsForSeed);
  const board = getBoard(rawBoard);
  // const board = getSrlV5Board(STANDARD);
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
    />
  );
}

async function getGeneralCounts(id: string): Promise<CountChangeRow[]> {
  const supabase = getSupabaseClient();
  const { data } = await supabase.from("general_count").select().eq('room_id', id);
  return data ?? [];
}

async function getColors(id: string): Promise<{ left: BingosyncColor, right: BingosyncColor }> {
  const supabase = getSupabaseClient();
  const { data } = await supabase.from("color").select().eq('room_id', id);
  if (data == null) {
    return { left: 'red', right: 'red' }
  }
  const left = data.find(entry => entry.is_left === true)?.color ?? 'red';
  const right = data.find(entry => entry.is_left === false)?.color ?? 'red';
  return { left, right };
}

function structureCounts(rawCounts: ReadonlyArray<CountChangeRow>): GeneralCounts {
  const generals: GeneralCounts = {};
  rawCounts.forEach(rawCount => {
    const goalState: CountState = generals[rawCount.goal] ?? { leftCounts: {}, rightCounts: {} };
    const toUpdate = rawCount.is_left ? goalState.leftCounts : goalState.rightCounts;
    toUpdate[rawCount.game] = rawCount.count;
    goalState[rawCount.is_left ? 'leftCounts' : 'rightCounts'] = toUpdate;
    generals[rawCount.goal] = goalState;
  });
  return generals;
}
