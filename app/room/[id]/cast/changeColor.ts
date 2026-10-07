"use server";

import { BingosyncColor, RawGoal } from "@/app/matches/parseBingosyncData";
import { readBingosyncCookie } from "../roomCookie";
import { getSelectUrl, RoomBackend } from "@/app/roomApi";
import broadcastToWebsockets from "../../broadcastToWebsockets";

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
      "Failed to find sessionid cookie! Please refresh the page.",
    );
  }

  if (roomBackend === "ufo50bingo") {
    const rawGoal: RawGoal = {
      type: "goal",
      player: {
        uuid: "",
        name: "Frank",
        color,
        is_spectator: false,
      },
      square: {
        name: "asdf",
        slot: `slot${slot + 1}`,
        colors: color,
      },
      player_color: color,
      color,
      remove: removeColor,
      timestamp: Date.now() / 1000,
    };
    await broadcastToWebsockets(id, JSON.stringify(rawGoal));
  } else {
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
}
