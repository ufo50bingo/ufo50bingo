"use server";

import getPersonalSessionCookie from "./getPersonalSessionCookie";

export default async function sendChat(
  id: string,
  text: string
): Promise<void> {
  const cookie = await getPersonalSessionCookie();
  if (cookie == null) {
    throw new Error(
      "Failed to find sessionid cookie! Please refresh the page."
    );
  }

  await fetch("https://www.bingosync.com/api/chat", {
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
