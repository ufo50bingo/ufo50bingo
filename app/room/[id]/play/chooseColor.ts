"use server";

import { BingosyncColor } from "@/app/matches/parseBingosyncData";
import { readBingosyncCookie } from "../roomCookie";
import { getColorUrl, RoomBackend } from "@/app/roomApi";

export default async function chooseColor(id: string, color: BingosyncColor, roomBackend: RoomBackend) {
  const cookie = await readBingosyncCookie();
  if (cookie == null) {
    throw new Error(
      "Failed to find sessionid cookie! Please refresh the page."
    );
  }

  await fetch(getColorUrl(roomBackend), {
    method: "PUT",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Cookie: cookie,
    },
    body: JSON.stringify({
      room: id,
      color,
    }),
  });
}
