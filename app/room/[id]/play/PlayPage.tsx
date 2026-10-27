import { BingosyncColor } from "@/app/matches/parseBingosyncData";
import PlayWrapper from "./PlayWrapper";
import getSql from "@/app/getSql";

type Props = {
  gameId: number;
};

export default async function PlayPage({ gameId }: Props) {
  const [initialFeed] = await Promise.all([
    // fetchBoard(id, roomBackend),
    fetchNewFeed(Number(gameId)),
    // fetchFeed(id, bingosyncCookie, roomBackend),
    // fetchTimerEvents(id),
    // getSocketKey(id, bingosyncCookie, roomBackend),
    // getSeed(id, roomBackend),
  ]);
  return (
    <PlayWrapper
      gameId={gameId}
      initialFeed={initialFeed}
      userId={1}
      // initialTimerEvents={timerEvents}
    />
  );
}

export type NewFeedItem = {
  type: "color_mark";
  user: {
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
    user: {
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
