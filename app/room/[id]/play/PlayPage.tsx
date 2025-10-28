import { fetchBoard, fetchFeed, getSocketKey } from "@/app/fetchMatchInfo";
import { getBoard } from "@/app/matches/parseBingosyncData";
import PlayWrapper from "./PlayWrapper";
import { RoomCookie, toBingosyncCookie } from "../roomCookie";
import getSeed from "../common/getSeed";
// import { STANDARD } from "@/app/pastas/standard";
// import getSrlV5Board from "@/app/practiceboard/getSrlV5Board";

type Props = {
  id: string;
  roomCookie: RoomCookie;
};

export default async function PlayPage({ id, roomCookie }: Props) {
  const bingosyncCookie = toBingosyncCookie(roomCookie);
  const [rawBoard, rawFeed, socketKey, seed] = await Promise.all([
    fetchBoard(id),
    fetchFeed(id, bingosyncCookie),
    getSocketKey(id, bingosyncCookie),
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
