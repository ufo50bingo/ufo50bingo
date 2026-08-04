import { parseRoomBackend } from "@/app/roomApi";
import CastPage from "./cast/CastPage";
import Login from "./Login";
import PlayPage from "./play/PlayPage";
import { readRoomCookie } from "./roomCookie";

export default async function RoomPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ b?: string }>;
}) {
  const [{ id }, roomCookie, { b: rawBackend }] = await Promise.all([params, readRoomCookie(), searchParams]);
  const roomBackend = parseRoomBackend(rawBackend);
  if (roomCookie == null) {
    return <Login id={id} roomBackend={roomBackend} />;
  }

  switch (roomCookie.view) {
    case "cast":
      return <CastPage id={id} roomCookie={roomCookie} roomBackend={roomBackend} />;
    case "play":
      return <PlayPage id={id} roomCookie={roomCookie} roomBackend={roomBackend} />;
  }
}
