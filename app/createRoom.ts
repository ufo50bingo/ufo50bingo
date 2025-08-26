"use server";

import getCsrfData from "./getCsrfData";
import { insertRoom } from "./insertRoom";

const BINGOSYNC_BASE_URL = "https://www.bingosync.com/";

export default async function createRoom(
  roomName: string,
  password: string,
  isGameNames: boolean,
  isLockout: boolean,
  pasta: string
): Promise<string> {
  const { cookie, token } = await getCsrfData();

  const createResponse = await fetch(BINGOSYNC_BASE_URL, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Cookie: cookie,
    },
    body: new URLSearchParams({
      csrfmiddlewaretoken: token,
      room_name: roomName,
      passphrase: password,
      nickname: "ufo50bingobot",
      game_type: "18",
      variant_type: isGameNames ? "172" : "187",
      custom_json: pasta,
      lockout_mode: isLockout ? "2" : "1",
      seed: "",
    }).toString(),
  });

  const roomURL = createResponse.url;

  if (roomURL === BINGOSYNC_BASE_URL || roomURL === "") {
    throw new Error("Malformed bingosync request");
  }

  // add room to table for tracking
  insertRoom({ url: roomURL, name: roomName, password });

  return createResponse.url;
}
