import { fetchBoard, fetchFeed, getSocketKey } from "@/app/fetchMatchInfo";
import { getBoard } from "@/app/matches/parseBingosyncData";
import PlayWrapper from "./PlayWrapper";
import getCookie from "@/app/cast/[id]/getCookie";
import getSeed from "@/app/cast/[id]/getSeed";
import Login from "@/app/cast/[id]/Login";
// import { STANDARD } from "@/app/pastas/standard";
// import getSrlV5Board from "@/app/practiceboard/getSrlV5Board";

export default async function PlayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const cookie = await getCookie(id, false);
  if (cookie == null) {
    return <Login />;
  }
  const [rawBoard, rawFeed, socketKey, seed] = await Promise.all([
    fetchBoard(id),
    fetchFeed(id, cookie),
    getSocketKey(id, cookie),
    getSeed(id),
  ]);
  const board = getBoard(rawBoard);
  // const board = getSrlV5Board(STANDARD);
  return (
    <PlayWrapper
      id={id}
      board={board}
      rawFeed={rawFeed}
      socketKey={socketKey}
      initialSeed={seed}
    />
  );
}
