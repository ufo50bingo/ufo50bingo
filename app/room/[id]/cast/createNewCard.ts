"use server";

import { readBingosyncCookie } from "../roomCookie";
import ufoGenerator from "@/app/generator/ufoGenerator";
import { STANDARD_UFO } from "@/app/pastas/standardUfo";

export default async function createNewCard(id: string): Promise<void> {
  const cookie = await readBingosyncCookie();
  if (cookie == null) {
    throw new Error(
      "Failed to find sessionid cookie! Please refresh the page."
    );
  }

  await fetch("https://www.bingosync.com/api/new-card", {
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
        ufoGenerator(STANDARD_UFO).map((goal) => ({ name: goal }))
      ),
      lockout_mode: "2",
      seed: "",
      is_spectator: true,
    }),
  });
}
