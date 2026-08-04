export type RoomBackend = "bingosync" | "celeste";

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

export function getBaseUrl(roomBackend: RoomBackend): string {
  return `https://${getDomain(roomBackend)}/`;
}

export function getRoomUrl(id: string, roomBackend: RoomBackend): string {
  return `https://${getDomain(roomBackend)}/room/${id}`;
}

export function getBoardUrl(id: string, roomBackend: RoomBackend): string {
  return `https://${getDomain(roomBackend)}/room/${id}/board`;
}

export function getFeedUrl(id: string, roomBackend: RoomBackend): string {
  return `https://${getDomain(roomBackend)}/room/${id}/feed`;
}

export function getSocketKeyUrl(id: string, roomBackend: RoomBackend): string {
  return `https://${getDomain(roomBackend)}/api/get-socket-key/${id}`;
}

export function getSelectUrl(roomBackend: RoomBackend): string {
  return `https://${getDomain(roomBackend)}/api/select`;
}

export function getNewCardUrl(roomBackend: RoomBackend): string {
  return `https://${getDomain(roomBackend)}/api/new-card`;
}

export function getRoomSettingsUrl(id: string, roomBackend: RoomBackend): string {
  return `https://${getDomain(roomBackend)}/room/${id}/room-settings`;
}

export function getChatUrl(roomBackend: RoomBackend): string {
  return `https://${getDomain(roomBackend)}/api/chat`;
}

export function getSocketUrl(roomBackend: RoomBackend): string {
  switch (roomBackend) {
    case "celeste":
      return "wss://sockets-celestebingo.rhelmot.io/broadcast";
    case "bingosync":
    default:
      return "wss://sockets.bingosync.com/broadcast";
  }
}

export function getJoinRoomUrl(roomBackend: RoomBackend): string {
  return `https://${getDomain(roomBackend)}/api/join-room`;
}

export function getColorUrl(roomBackend: RoomBackend): string {
  return `https://${getDomain(roomBackend)}/api/color`;
}

export function getRevealUrl(roomBackend: RoomBackend): string {
  return `https://${getDomain(roomBackend)}/api/revealed`;
}

export function getRoomLink(id: string, password: string, roomBackend: RoomBackend): string {
  const searchParams = new URLSearchParams({
    p: password,
  });
  if (roomBackend !== "bingosync") {
    searchParams.append("b", roomBackend);
  }
  return `/room/${id}?${searchParams.toString()}`;
}
