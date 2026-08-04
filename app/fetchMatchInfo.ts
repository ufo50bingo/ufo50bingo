"use server";

import getSql from "./getSql";
import { RawBoard, RawFeed } from "./matches/parseBingosyncData";
import { getBoardUrl, getFeedUrl, getSocketKeyUrl, RoomBackend } from "./roomApi";

export async function getSessionCookie(id: string): Promise<string> {
  const sql = getSql();
  const sqlResult =
    await sql`SELECT sessionid_cookie FROM match WHERE id = ${id}`;
  const cookie: null | void | string = sqlResult?.[0]?.sessionid_cookie;

  if (cookie == null) {
    throw new Error(`Failed to find cookie for match ${id}`);
  }
  return cookie;
}

export async function fetchBoard(id: string, roomBackend: RoomBackend): Promise<RawBoard> {
  const boardResult = await fetch(
    getBoardUrl(id, roomBackend),
    {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return await boardResult.json();
}

export async function fetchFeed(id: string, cookie: string, roomBackend: RoomBackend): Promise<RawFeed> {
  const url = new URL(getFeedUrl(id, roomBackend));
  url.search = new URLSearchParams({
    full: "true",
  }).toString();

  const feedResponse = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookie,
    },
  });
  const feedJson: RawFeed = await feedResponse.json();
  return feedJson;
}

export async function getSocketKey(
  id: string,
  cookie: string,
  roomBackend: RoomBackend,
): Promise<string> {
  const socketKeyUrl = getSocketKeyUrl(id, roomBackend);
  const socketKeyResponse = await fetch(socketKeyUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookie,
    },
  });

  const json = await socketKeyResponse.json();
  const socketKey: null | void | string = json["socket_key"];
  if (socketKey == null || socketKey === "") {
    throw new Error(`Failed to get socket key.`);
  }
  return socketKey;
}
