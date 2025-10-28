"use server";

import { readBingosyncCookie } from "../roomCookie";

export default async function revealBoard(id: string) {
  const cookie = await readBingosyncCookie();
  if (cookie == null) {
    throw new Error(
      "Failed to find sessionid cookie! Please refresh the page."
    );
  }

  await fetch("https://www.bingosync.com/api/revealed", {
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
