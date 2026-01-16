"use server";

import getSql from "../getSql";
import { readSession, writeSession } from "../session/sessionUtil";
import { LocalDate, toISODate } from "./localDate";
import { DailyData } from "./page";

export default async function saveDailyBoard(
  { board, title, creator, description, seed }: DailyData,
  date: LocalDate
): Promise<void> {
  const session = await readSession();
  if (session == null) {
    throw new Error("No session found!");
  }
  if (session.admin !== true) {
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
      WHERE date = ${toISODate(date)}`;

  await writeSession(session);
}
