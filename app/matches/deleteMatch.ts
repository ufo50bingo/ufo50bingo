"use server";

import { revalidatePath } from "next/cache";
import getSql from "../getSql";

export default async function deleteMatch(id: string): Promise<void> {
  const sql = getSql(false);

  await sql`UPDATE match
    SET
      is_deleted = TRUE
    WHERE id = ${id}`;
  revalidatePath("/matches");
}
