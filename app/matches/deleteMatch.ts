"use server";

import { revalidateTag } from "next/cache";
import getSql from "../getSql";

export default async function deleteMatch(id: string): Promise<void> {
  const sql = getSql();

  await sql`UPDATE match
    SET
      is_deleted = TRUE
    WHERE id = ${id}`;
  revalidateTag("matches", "max");
}
