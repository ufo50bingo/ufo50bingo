import getBroadcastToken from "../common/getBroadcastToken";
import CastWrapper from "./CastWrapper";
import { CountState } from "./useSyncedState";
import { fetchData, NewFeedItem, SQLTemplate } from "@/app/fetchFeed";

type Props = {
  sql: SQLTemplate;
  userId: number;
  gameId: number;
  alreadyFetched: ReadonlyArray<NewFeedItem>;
};

export type GeneralCounts = { [goal: string]: CountState };

export default async function CastPage({
  sql,
  gameId,
  userId,
  alreadyFetched,
}: Props) {
  const [data, token] = await Promise.all([
    fetchData(sql, gameId, "cast"),
    getBroadcastToken(gameId),
  ]);
  const feed = data.feed.concat(alreadyFetched);
  feed.sort((a, b) => a.time - b.time);
  data.feed = feed;
  return (
    <CastWrapper game={data} userId={userId} token={token} isWatch={false} />
  );
}
