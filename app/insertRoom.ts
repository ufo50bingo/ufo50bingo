"use server";

import getSql from "./getSql";

const ROOM_PREFIX = "https://www.bingosync.com/room/";

type Props = {
  url: string;
  name: string;
  password: string;
};

export async function insertRoom({
  url,
  name,
  password,
}: Props): Promise<void> {
  if (!url.startsWith(ROOM_PREFIX)) {
    console.error("Unexpected bingosync room URL", url);
    return;
  }
  const id = url.slice(ROOM_PREFIX.length);
  const sql = getSql();

  await sql`INSERT INTO room (id, name, password, changelog) VALUES (${id}, ${name}, ${password}, null);`;
}
