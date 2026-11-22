import { fetchBoard, fetchFeed, getSocketKey } from "@/app/fetchMatchInfo";
import { BingosyncColor, getBoard } from "@/app/matches/parseBingosyncData";
import PlayWrapper from "./PlayWrapper";
import { RoomCookie, toBingosyncCookie } from "../roomCookie";
import getSeed from "../common/getSeed";
import fetchTimerEvents from "../common/fetchTimerEvents";
import { RoomBackend } from "@/app/roomApi";
import getSql from "@/app/getSql";

type Props = {
  id: string;
  roomCookie: RoomCookie;
  roomBackend: RoomBackend;
};

export default async function PlayPage({ id, roomCookie, roomBackend }: Props) {
  const [rawFeed, rawTimerEvents] = await Promise.all([
    // fetchBoard(id, roomBackend),
    fetchNewFeed(Number(id)),
    // fetchFeed(id, bingosyncCookie, roomBackend),
    fetchTimerEvents(id),
    // getSocketKey(id, bingosyncCookie, roomBackend),
    // getSeed(id, roomBackend),
  ]);
  const timerEvents = rawTimerEvents;
  return (
    <PlayWrapper
      id={id}
      rawFeed={rawFeed}
      socketKey=""
      initialSeed={0}
      playerName="Unknown"
      initialTimerEvents={timerEvents}
      roomBackend="ufo50bingo"
    />
  );
}

type NewFeedItem = {
  type: "color_mark";
  player: {
    id: number;
    // todo: fetch player names separately
    name: string;
  };
  color: BingosyncColor;
  squareIndex: number;
  time: number;
  isClear: boolean;
};

export type NewFeed = ReadonlyArray<NewFeedItem>;

async function fetchNewFeed(gameId: number): Promise<NewFeed> {
  const sql = getSql(false);
  const result = await sql`
    SELECT
      EXTRACT(EPOCH FROM time)::DOUBLE PRECISION AS unixtime,
      user_id,
      square_index,
      color,
      is_clear
    FROM color_mark
    WHERE game_id = ${gameId}
  `;
  const marks: ReadonlyArray<NewFeedItem> = result.map((raw) => ({
    type: "color_mark",
    player: {
      id: Number(raw.user_id),
      name: "Unknown",
    },
    squareIndex: raw.square_index,
    time: Number(raw.unixtime),
    color: raw.color,
    isClear: Boolean(raw.is_clear),
  }));
  return marks;
}
