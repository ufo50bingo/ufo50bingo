import { cookies } from "next/headers";

export type RoomView = "cast" | "play";

export type RoomCookie = {
  id: string;
  name: string;
  view: RoomView;
};

function toRoomView(view: null | undefined | string): null | RoomView {
  switch (view) {
    case "cast":
      return "cast";
    case "play":
      return "play";
    default:
      return null;
  }
}

function serializeRoomCookie(cookie: RoomCookie): string {
  return JSON.stringify(cookie);
}

function deserializeRoomCookie(
  serialized: null | undefined | string
): null | RoomCookie {
  if (serialized == null) {
    return null;
  }
  try {
    const parsed = JSON.parse(serialized);
    const id: null | undefined | string = parsed?.id;
    const name: null | undefined | string = parsed?.name;
    const view: null | undefined | RoomView = toRoomView(parsed?.view);
    if (id == null || name == null || view == null) {
      return null;
    }
    return { id, name, view };
  } catch {
    return null;
  }
}

export async function setRoomCookie(
  id: string,
  cookie: RoomCookie
): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set("room", serializeRoomCookie(cookie), {
    expires: Date.now() + 2 * 7 * 24 * 60 * 60 * 1000,
    maxAge: 2 * 7 * 24 * 60 * 60,
    sameSite: "lax",
    path: `/room/${id}`,
  });
}

export async function readRoomCookie(): Promise<null | RoomCookie> {
  const cookieStore = await cookies();
  const serialized = cookieStore.get("room");
  return deserializeRoomCookie(serialized?.value);
}

export function toBingosyncCookie(roomCookie: RoomCookie): string {
  return `sessionid=${roomCookie.id}; HttpOnly; Max-Age=1209600; Path=/; SameSite=Lax`;
}

export async function readBingosyncCookie(): Promise<null | string> {
  const roomCookie = await readRoomCookie();
  if (roomCookie == null) {
    return null;
  }
  return toBingosyncCookie(roomCookie);
}
