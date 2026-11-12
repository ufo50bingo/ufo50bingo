import CastWrapper from "./CastWrapper";
import { CountState } from "./useSyncedState";
import { FeedMember, fetchData } from "@/app/fetchFeed";

type Props = {
  userId: number;
  gameId: number;
  memberFeed: ReadonlyArray<FeedMember>;
};

export type GeneralCounts = { [goal: string]: CountState };

export default async function CastPage({ gameId, userId, memberFeed }: Props) {
  const data = await fetchData(Number(gameId), memberFeed, false);
  return (
    <CastWrapper
      gameId={gameId}
      initialFeed={data.feed}
      squares={data.squares}
      pasta={data.pasta}
      subcategories={data.subcategories}
      userId={userId}
    />
  );
}

// async function getGeneralCounts(id: string): Promise<CountChangeRow[]> {
//   const supabase = getSupabaseClient();
//   const { data } = await supabase
//     .from("general_count")
//     .select()
//     .eq("room_id", id);
//   return data ?? [];
// }

// async function getColors(
//   id: string,
// ): Promise<{ left: BingosyncColor; right: BingosyncColor }> {
//   const supabase = getSupabaseClient();
//   const { data } = await supabase.from("color").select().eq("room_id", id);
//   if (data == null) {
//     return { left: "red", right: "red" };
//   }
//   const left = data.find((entry) => entry.is_left === true)?.color ?? "red";
//   const right = data.find((entry) => entry.is_left === false)?.color ?? "red";
//   return { left, right };
// }

// async function getCurrentGames(id: string): Promise<CurrentGameRow[]> {
//   const supabase = getSupabaseClient();
//   const { data } = await supabase
//     .from("current_game")
//     .select()
//     .eq("room_id", id)
//     .order("start_time", { ascending: false });
//   return data ?? [];
// }

// function structureCounts(
//   rawCounts: ReadonlyArray<CountChangeRow>,
// ): GeneralCounts {
//   const generals: GeneralCounts = {};
//   rawCounts.forEach((rawCount) => {
//     const goalState: CountState = generals[rawCount.goal] ?? [];
//     const toUpdate = goalState[rawCount.player_num] ?? {};
//     toUpdate[rawCount.game] = rawCount.count;

//     const newGoalState = [...goalState];
//     newGoalState[rawCount.player_num] = toUpdate;
//     generals[rawCount.goal] = newGoalState;
//   });
//   return generals;
// }
