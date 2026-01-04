import CastPage from "./cast/CastPage";
import Login from "./Login";
import PlayPage from "./play/PlayPage";
import { readRoomCookie } from "./roomCookie";

export default async function RoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [{ id }, roomCookie] = await Promise.all([params, readRoomCookie()]);
  if (roomCookie == null) {
    return <Login id={id} />;
  }

  switch (roomCookie.view) {
    case "cast":
      return <CastPage id={id} roomCookie={roomCookie} />;
    case "play":
      return <PlayPage id={id} roomCookie={roomCookie} />;
  }
}
