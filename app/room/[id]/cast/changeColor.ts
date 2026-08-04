"use server";

import { BingosyncColor } from "@/app/matches/parseBingosyncData";
import { readBingosyncCookie } from "../roomCookie";
import { getSelectUrl, RoomBackend } from "@/app/roomApi";

export default async function changeColor(
  id: string,
  slot: number,
  color: BingosyncColor,
  removeColor: boolean,
  roomBackend: RoomBackend,
): Promise<void> {
  const cookie = await readBingosyncCookie();
  if (cookie == null) {
    throw new Error(
      "Failed to find sessionid cookie! Please refresh the page."
    );
  }

  await fetch(getSelectUrl(roomBackend), {
    method: "PUT",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Cookie: cookie,
    },
    body: JSON.stringify({
      room: id,
      slot: (slot + 1).toString(),
      color,
      remove_color: removeColor,
    }),
  });
}
