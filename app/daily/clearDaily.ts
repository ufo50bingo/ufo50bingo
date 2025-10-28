"use server";

import getSql from "../getSql";

export default async function clearDaily(date: string): Promise<void> {
  const sql = getSql(false);
  await sql`DELETE FROM daily WHERE date = ${date};`;
}