import Login from "./cast/Login";
import { readRoomCookie } from "./roomCookie";
// import { STANDARD } from "@/app/pastas/standard";
// import getSrlV5Board from "@/app/practiceboard/getSrlV5Board";

export default async function RoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [{ id: _id }, roomCookie] = await Promise.all([
    params,
    readRoomCookie(),
  ]);
  if (roomCookie == null) {
    return <Login />;
  }

  switch (roomCookie.view) {
    case "cast":
    case "play":
      return null;
  }
}
