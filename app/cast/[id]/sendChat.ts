"use server";

export default async function sendChat(
  id: string,
  text: string,
  cookie: string
) {
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
  return;
}
