import getBroadcastToken from "../common/getBroadcastToken";
import PlayWrapper from "./PlayWrapper";
import { fetchData, NewFeedItem } from "@/app/fetchFeed";

type Props = {
  userId: number;
  gameId: number;
  alreadyFetched: ReadonlyArray<NewFeedItem>;
};

export default async function PlayPage({
  gameId,
  userId,
  alreadyFetched,
}: Props) {
  const [data, token] = await Promise.all([
    fetchData(gameId, "play"),
    getBroadcastToken(gameId),
  ]);
  const feed = data.feed.concat(alreadyFetched);
  feed.sort((a, b) => a.time - b.time);
  return (
    <PlayWrapper
      gameId={gameId}
      initialFeed={feed}
      squareNames={data.squares.map((square) => square.name)}
      userId={userId}
      token={token}
      fetchedPasta={data.fetchedPasta}
      pastaId={data.pastaId}
    />
  );
}
