"use server";

import getSql from "../getSql";
import { LocalDate, toISODate } from "./localDate";
import { DailyData } from "./page";

export default async function saveDailyBoard({ board, title, creator, description }: DailyData, date: LocalDate): Promise<void> {
  const sql = getSql(false);
  await sql`
      UPDATE daily
      SET
        board = ${JSON.stringify(board)},
        title = ${title},
        creator = ${creator},
        description = ${description}
      WHERE date = ${toISODate(date)}`;
}