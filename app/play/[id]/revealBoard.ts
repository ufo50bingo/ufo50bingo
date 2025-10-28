"use server";

import getPersonalSessionCookie from "@/app/cast/[id]/getPersonalSessionCookie";

export default async function revealBoard(id: string) {
  const cookie = await getPersonalSessionCookie();
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
