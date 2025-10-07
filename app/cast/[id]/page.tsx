import { fetchBoard, fetchFeed, getSocketKey } from "@/app/fetchMatchInfo";
import { getBoard } from "@/app/matches/parseBingosyncData";
import Login from "./Login";
import getCookie from "./getCookie";
import getSeed from "./getSeed";
import CastWrapper from "./CastWrapper";
// import { STANDARD } from "@/app/pastas/standard";
// import getSrlV5Board from "@/app/practiceboard/getSrlV5Board";

type FilterParams = {
  use_bot: string;
};

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
  const [rawBoard, rawFeed, socketKey, seed] = await Promise.all([
    fetchBoard(id),
    fetchFeed(id, cookie),
    getSocketKey(id, cookie),
    getSeed(id),
  ]);
  const board = getBoard(rawBoard);
  // const board = getSrlV5Board(STANDARD);
  return (
    <CastWrapper
      id={id}
      board={board}
      rawFeed={rawFeed}
      socketKey={socketKey}
      seed={seed}
    />
  );
}
