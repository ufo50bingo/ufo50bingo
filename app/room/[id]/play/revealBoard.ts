"use server";

import { getRevealUrl, RoomBackend } from "@/app/roomApi";
import { readBingosyncCookie } from "../roomCookie";

export default async function revealBoard(id: string, roomBackend: RoomBackend) {
  const cookie = await readBingosyncCookie();
  if (cookie == null) {
    throw new Error(
      "Failed to find sessionid cookie! Please refresh the page."
    );
  }

  await fetch(getRevealUrl(roomBackend), {
    method: "PUT",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Cookie: cookie,
    },
    body: JSON.stringify({
      room: id,
    }),
  });
}
