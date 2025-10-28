"use server";

import getPersonalSessionCookie from "@/app/cast/[id]/getPersonalSessionCookie";
import { BingosyncColor } from "@/app/matches/parseBingosyncData";

export default async function chooseColor(id: string, color: BingosyncColor) {
  const cookie = await getPersonalSessionCookie();
  if (cookie == null) {
    throw new Error(
      "Failed to find sessionid cookie! Please refresh the page."
    );
  }

  await fetch("https://www.bingosync.com/api/color", {
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
