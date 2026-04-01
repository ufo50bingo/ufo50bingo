"use server";

import { revalidatePath } from "next/cache";
import getSql from "../getSql";
import { readSession, writeSession } from "../session/sessionUtil";
import removeFromGsheet from "./removeFromGsheet";

export default async function deleteMatch(id: string): Promise<void> {
  const session = await readSession();
  if (session == null) {
    throw new Error("No session found!");
  }

  const sql = getSql(false);

  const sqlResult = session.admin
    ? await sql`UPDATE match
    SET
      is_deleted = TRUE
    WHERE id = ${id}
    RETURNING id, league_season`
    : await sql`UPDATE match
    SET
      is_deleted = TRUE
    WHERE id = ${id}
      AND creator_id = ${session.id}
    RETURNING id, league_season`;

  if (sqlResult.length === 0) {
    throw new Error(
      "Match not found or you do not have permission to delete it.",
    );
  }
  revalidatePath("/matches");
  await writeSession(session);
  await removeFromGsheet(id, sqlResult[0].league_season);
}
