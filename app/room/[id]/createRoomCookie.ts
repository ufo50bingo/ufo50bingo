"use server";

import { RoomView, setRoomCookie } from "./roomCookie";

const SESSIONID_REGEX = /sessionid=([^;]+);/;

export default async function createRoomCookie(
  id: string,
  name: string,
  password: string,
  view: RoomView
) {
  const fullName = name + (view === "cast" ? " (admin)" : "");
  const joinResponse = await fetch(`https://www.bingosync.com/api/join-room`, {
    method: "POST",
    redirect: "manual",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: JSON.stringify({
      room: id,
      nickname: fullName,
      password,
      // typo in bingosync code
      is_specator: view !== "play",
    }).toString(),
  });

  const sessionCookie = joinResponse.headers.get("Set-Cookie");
  if (sessionCookie == null) {
    throw new Error(`Failed to fetch session cookie for id ${id}`);
  }

  const result = sessionCookie.match(SESSIONID_REGEX);
  if (result == null || result.length < 2) {
    throw new Error(`Failed to find sessionid in bingosync response`);
  }
  await setRoomCookie(id, { id: result[1], name: fullName, view });
}
