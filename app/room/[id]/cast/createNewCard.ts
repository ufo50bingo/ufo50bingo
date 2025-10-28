"use server";

import { STANDARD } from "@/app/pastas/standard";
import createPasta from "@/app/createboard/createPasta";
import getDefaultDifficulties from "@/app/createboard/getDefaultDifficulties";
import { readBingosyncCookie } from "../roomCookie";

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
      variant_type: "187",
      custom_json: JSON.stringify(
        createPasta(STANDARD, getDefaultDifficulties(STANDARD))
      ),
      lockout_mode: "2",
      seed: "",
      is_spectator: true,
    }),
  });
}
