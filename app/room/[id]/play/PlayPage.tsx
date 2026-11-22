import getBroadcastToken from "../common/getBroadcastToken";
import PlayWrapper from "./PlayWrapper";
import { FeedMember, fetchData } from "@/app/fetchFeed";

type Props = {
  userId: number;
  gameId: number;
  memberFeed: ReadonlyArray<FeedMember>;
};

export default async function PlayPage({ gameId, userId, memberFeed }: Props) {
  const [data, token] = await Promise.all([
    fetchData(gameId, memberFeed, true),
    getBroadcastToken(gameId),
  ]);
  return (
    <PlayWrapper
      gameId={gameId}
      initialFeed={data.feed}
      squareNames={data.squares.map((square) => square.name)}
      userId={userId}
      token={token}
      fetchedPasta={data.fetchedPasta}
      pastaId={data.pastaId}
    />
  );
}
