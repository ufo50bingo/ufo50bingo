"use server";

import { revalidatePath } from "next/cache";
import getSql from "../getSql";
import getSession from "../getSession";

export default async function deleteMatch(gameId: number): Promise<void> {
  const session = await getSession();
  const user = session?.user;
  if (user == null) {
    throw new Error("You must be logged in to delete a match.");
  }

  const isAdmin = user.isAdmin ?? false;
  const userId = Number(user.id);

  const sql = getSql(false);
  const result = await sql`
    UPDATE game
    SET is_deleted = TRUE
    WHERE id = ${gameId}
      AND NOT is_deleted
      AND (${isAdmin}::BOOLEAN OR creator_id = ${userId})
    RETURNING id`;
  if (result.length === 0) {
    throw new Error(
      "Match not found, or you don't have permission to delete it.",
    );
  }

  revalidatePath("/matches");
  revalidatePath(`/match/${gameId}`);

  // await removeFromGsheet(id, sqlResult[0].league_season);
}
