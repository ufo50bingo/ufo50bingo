import { fetchBoard, fetchFeed, getSocketKey } from "@/app/fetchMatchInfo";
import { getBoard } from "@/app/matches/parseBingosyncData";
import getSeed from "@/app/cast/[id]/getSeed";
import Login from "@/app/cast/[id]/Login";
import { readRoomCookie, toBingosyncCookie } from "./roomCookie";
import PlayWrapper from "@/app/play/[id]/PlayWrapper";
// import { STANDARD } from "@/app/pastas/standard";
// import getSrlV5Board from "@/app/practiceboard/getSrlV5Board";

export default async function RoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [{ id }, roomCookie] = await Promise.all([params, readRoomCookie()]);
  if (roomCookie == null) {
    return <Login />;
  }

  switch (cookie.view) {
    case "cast":

    case "play":
  }
}
