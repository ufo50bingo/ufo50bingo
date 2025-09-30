"use server";

import getSql from "@/app/getSql";

export default async function getSocketKey(id: string): Promise<string> {
  const socketKeyUrl = `https://www.bingosync.com/api/get-socket-key/${id}`;
  const sql = getSql();
  const sqlResult =
    await sql`SELECT sessionid_cookie FROM match WHERE id = ${id}`;
  const cookie: null | void | string = sqlResult?.[0]?.sessionid_cookie;

  if (cookie == null) {
    throw new Error(`Failed to find cookie for match ${id}`);
  }

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
