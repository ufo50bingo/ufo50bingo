"use server";

import { revalidatePath } from "next/cache";
import getSql from "../getSql";

export default async function deleteMatch(id: string): Promise<void> {
  const sql = getSql();

  await sql`DELETE FROM match WHERE id = ${id};`;
  revalidatePath("/matches");
}
