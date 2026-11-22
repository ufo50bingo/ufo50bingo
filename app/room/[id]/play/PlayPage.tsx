import getBroadcastToken from "../common/getBroadcastToken";
import PlayWrapper from "./PlayWrapper";
import { fetchData, NewFeedItem, SQLTemplate } from "@/app/fetchFeed";

type Props = {
  sql: SQLTemplate;
  userId: number;
  gameId: number;
  alreadyFetched: ReadonlyArray<NewFeedItem>;
};

export default async function PlayPage({
  sql,
  gameId,
  userId,
  alreadyFetched,
}: Props) {
  const [data, token] = await Promise.all([
    fetchData(sql, gameId, "play"),
    getBroadcastToken(gameId),
  ]);
  const feed = data.feed.concat(alreadyFetched);
  feed.sort((a, b) => a.time - b.time);
  data.feed = feed;
  return <PlayWrapper game={data} userId={userId} token={token} />;
}
