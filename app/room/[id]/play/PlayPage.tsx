import { fetchBoard, fetchFeed, getSocketKey } from "@/app/fetchMatchInfo";
import { getBoard } from "@/app/matches/parseBingosyncData";
import PlayWrapper from "./PlayWrapper";
import { RoomCookie, toBingosyncCookie } from "../roomCookie";
import getSeed from "../common/getSeed";

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
  return (
    <PlayWrapper
      id={id}
      board={board}
      rawFeed={rawFeed}
      socketKey={socketKey}
      initialSeed={seed}
      playerName={roomCookie.name}
    />
  );
}
