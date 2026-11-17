"use server";

import getSql from "../getSql";
import getIsAdmin from "../getIsAdmin";
import { LocalDate, toISODate } from "./localDate";
import { DailyData } from "./page";

export default async function saveDailyBoard(
  { board, title, creator, description, seed, variant }: DailyData,
  date: LocalDate
): Promise<void> {
  if (!(await getIsAdmin())) {
    throw new Error("Only admins can edit the daily board!");
  }

  const sql = getSql(false);
  await sql`
      UPDATE daily
      SET
        board = ${JSON.stringify(board)},
        title = ${title},
        creator = ${creator},
        description = ${description},
        seed = ${seed}
      WHERE
        date = ${toISODate(date)}
        AND variant = ${variant}`;
}
