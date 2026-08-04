import { fetchBoard, fetchFeed, getSocketKey } from "@/app/fetchMatchInfo";
import { getBoard } from "@/app/matches/parseBingosyncData";
import PlayWrapper from "./PlayWrapper";
import { RoomCookie, toBingosyncCookie } from "../roomCookie";
import getSeed from "../common/getSeed";
import fetchTimerEvents from "../common/fetchTimerEvents";
import { RoomBackend } from "@/app/roomApi";

type Props = {
  id: string;
  roomCookie: RoomCookie;
  roomBackend: RoomBackend;
};

export default async function PlayPage({ id, roomCookie, roomBackend }: Props) {
  const bingosyncCookie = toBingosyncCookie(roomCookie);
  const [rawBoard, rawFeed, rawTimerEvents, socketKey, seed] =
    await Promise.all([
      fetchBoard(id, roomBackend),
      fetchFeed(id, bingosyncCookie, roomBackend),
      fetchTimerEvents(id),
      getSocketKey(id, bingosyncCookie, roomBackend),
      getSeed(id, roomBackend),
    ]);
  const timerEvents = rawTimerEvents.filter((e) => e.seed === seed);
  const board = getBoard(rawBoard);
  return (
    <PlayWrapper
      id={id}
      board={board}
      rawFeed={rawFeed}
      socketKey={socketKey}
      initialSeed={seed}
      playerName={roomCookie.name}
      initialTimerEvents={timerEvents}
      roomBackend={roomBackend}
    />
  );
}
