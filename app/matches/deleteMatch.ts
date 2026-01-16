"use server";

import { revalidatePath } from "next/cache";
import getSql from "../getSql";
import { readSession, writeSession } from "../session/sessionUtil";

export default async function deleteMatch(id: string): Promise<void> {
  const session = await readSession();
  if (session == null) {
    throw new Error("No session found!");
  }

  const sql = getSql(false);

  if (session.admin) {
    await sql`UPDATE match
    SET
      is_deleted = TRUE
    WHERE id = ${id}`;
  } else {
    const sqlResult = await sql`UPDATE match
    SET
      is_deleted = TRUE
    WHERE id = ${id}
      AND creator_id = ${session.id}
    RETURNING id`;

    if (sqlResult.length === 0) {
      throw new Error(
        "Match not found or you do not have permission to delete it."
      );
    }
  }
  revalidatePath("/matches");
  await writeSession(session);
}
