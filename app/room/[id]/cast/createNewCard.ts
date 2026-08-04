"use server";

import { readBingosyncCookie } from "../roomCookie";
import ufoGenerator from "@/app/generator/ufoGenerator";
import { STANDARD_UFO } from "@/app/pastas/standardUfo";
import { getNewCardUrl, RoomBackend } from "@/app/roomApi";

export default async function createNewCard(id: string, roomBackend: RoomBackend): Promise<void> {
  const cookie = await readBingosyncCookie();
  if (cookie == null) {
    throw new Error(
      "Failed to find sessionid cookie! Please refresh the page.",
    );
  }

  await fetch(getNewCardUrl(roomBackend), {
    method: "PUT",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Cookie: cookie,
    },
    body: JSON.stringify({
      room: id,
      hide_card: true,
      game_type: "18",
      variant_type: "18",
      custom_json: JSON.stringify(
        ufoGenerator(STANDARD_UFO).map((goal) => ({ name: goal })),
      ),
      lockout_mode: "2",
      seed: Math.ceil(999999 * Math.random()).toString(),
      is_spectator: true,
    }),
  });
}
