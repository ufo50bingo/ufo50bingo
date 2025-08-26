"use server";

import { revalidatePath } from "next/cache";
import { CommonMatchProps } from "./createMatch";
import getSql from "./getSql";

const ROOM_PREFIX = "https://www.bingosync.com/room/";

interface Props extends CommonMatchProps {
  url: string;
}

function bool(val: boolean): "TRUE" | "FALSE" {
  return val ? "TRUE" : "FALSE";
}

export async function insertMatch({
  url,
  roomName,
  password,
  isPublic,
  variant,
  isCustom,
  isLockout,
}: Props): Promise<void> {
  if (!url.startsWith(ROOM_PREFIX)) {
    console.error("Unexpected bingosync room URL", url);
    return;
  }
  const id = url.slice(ROOM_PREFIX.length);
  const sql = getSql();

  console.log("inserting new match", id);

  await sql`INSERT INTO match (
    id,
    name,
    password,
    is_public,
    variant,
    is_custom,
    is_lockout
  ) VALUES (
    ${id},
    ${roomName},
    ${password},
    ${bool(isPublic)},
    ${variant},
    ${bool(isCustom)},
    ${bool(isLockout)}
  );`;
  revalidatePath("/matches");

  console.log("finished inserting new match", id);
}
