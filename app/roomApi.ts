export type RoomBackend = "bingosync" | "celeste" | "ufo50bingo";

function getDomain(roomBackend: RoomBackend): string {
  switch (roomBackend) {
    case "celeste":
      return "celestebingo.rhelmot.io";
    case "bingosync":
    default:
      return "www.bingosync.com";
  }
}

export function parseRoomBackend(raw: string | null | undefined): RoomBackend {
  switch (raw) {
    case "celeste":
      return "celeste";
    case "bingosync":
    default:
      return "bingosync";
  }
}

export function getBoardUrl(id: string, roomBackend: RoomBackend): string {
  return `https://${getDomain(roomBackend)}/room/${id}/board`;
}

export function getFeedUrl(id: string, roomBackend: RoomBackend): string {
  return `https://${getDomain(roomBackend)}/room/${id}/feed`;
}

export function getRoomLink(
  id: string,
  password: string,
  roomBackend: RoomBackend,
): string {
  const searchParams = new URLSearchParams({
    p: password,
  });
  if (roomBackend !== "bingosync") {
    searchParams.append("b", roomBackend);
  }
  return `/room/${id}?${searchParams.toString()}`;
}
