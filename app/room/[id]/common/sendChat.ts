"use server";

import { readBingosyncCookie } from "../roomCookie";

export default async function sendChat(
  id: string,
  text: string
): Promise<void> {
  const cookie = await readBingosyncCookie();
  if (cookie == null) {
    throw new Error(
      "Failed to find sessionid cookie! Please refresh the page."
    );
  }

  await fetch("https://celestebingo.rhelmot.io/api/chat", {
    method: "PUT",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Cookie: cookie,
    },
    body: JSON.stringify({
      room: id,
      text,
    }),
  });
}
