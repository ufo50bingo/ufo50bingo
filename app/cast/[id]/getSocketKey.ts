"use server";

import getCsrfData from "@/app/getCsrfData";
import getSql from "@/app/getSql";

const SOCKET_KEY_REGEX = /var temporarySocketKey = "([a-zA-Z0-9-_]+)";/;

export default async function getSocketKey(id: string): Promise<string> {
  const roomURL = `https://www.bingosync.com/room/${id}`;
  const sql = getSql();
  const [{ cookie, token }, sqlResult] = await Promise.all([
    getCsrfData(),
    sql`SELECT name, password FROM match WHERE id = ${id}`,
  ]);
  const name: null | void | string = sqlResult?.[0]?.name;
  const password: null | void | string = sqlResult?.[0]?.password;

  if (password == null || name == null) {
    throw new Error(`No name or password found for match ${id}`);
  }

  const loginResponse = await fetch(roomURL, {
    method: "POST",
    redirect: "manual",
    credentials: "include",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Cookie: cookie,
    },
    body: new URLSearchParams({
      csrfmiddlewaretoken: token,
      encoded_room_uuid: id,
      room_name: "wrongroomname",
      creator_name: "ufo50bingobot",
      game_name: "Custom (Advanced) - SRL v5",
      player_name: "ufo50bingobot",
      passphrase: password,
      is_spectator: "on",
    }).toString(),
  });

  const sessionCookie = loginResponse.headers.get("Set-Cookie");
  if (sessionCookie == null) {
    throw new Error(`Failed to fetch session cookie for id ${id}`);
  }

  const roomResponse = await fetch(roomURL, {
    method: "GET",
    credentials: "include",
    headers: {
      Cookie: `${cookie}; ${sessionCookie}`,
    },
  });

  const bodyText = await roomResponse.text();
  const result = bodyText.match(SOCKET_KEY_REGEX);
  if (result == null || result.length < 2) {
    throw new Error(`Failed to find temporarySocketKey in bingosync response`);
  }
  return result[1];
}
