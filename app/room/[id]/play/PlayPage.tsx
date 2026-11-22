import PlayWrapper from "./PlayWrapper";
import { FeedMember, fetchData } from "@/app/fetchFeed";

type Props = {
  userId: number;
  gameId: number;
  memberFeed: ReadonlyArray<FeedMember>;
};

export default async function PlayPage({ gameId, userId, memberFeed }: Props) {
  const data = await fetchData(Number(gameId), memberFeed, true);
  return (
    <PlayWrapper
      gameId={gameId}
      initialFeed={data.feed}
      squareNames={data.squares.map((square) => square.name)}
      userId={userId}
    />
  );
}
