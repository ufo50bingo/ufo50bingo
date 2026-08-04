"use server";

import { BingosyncColor } from "@/app/matches/parseBingosyncData";
import { readBingosyncCookie } from "../roomCookie";
import { getColorUrl } from "@/app/roomApi";

export default async function chooseColor(id: string, color: BingosyncColor) {
  const cookie = await readBingosyncCookie();
  if (cookie == null) {
    throw new Error(
      "Failed to find sessionid cookie! Please refresh the page."
    );
  }

  await fetch(getColorUrl("bingosync"), {
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
