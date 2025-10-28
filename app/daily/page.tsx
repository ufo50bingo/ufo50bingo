
import getSrlV5Board from "./getSrlV5Board";
import { STANDARD } from "../pastas/standard";
import getSql from "../getSql";
import Daily from "./Daily";

function getEasternISODate(): string {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
  });
  const parts = formatter.formatToParts(new Date());
  let month = '01';
  let day = '01';
  let year = '1970';
  parts.forEach(part => {
    if (part.type === "month") {
      month = part.value;
    } else if (part.type === "day") {
      day = part.value;
    } else if (part.type === "year") {
      year = part.value;
    }
  });
  return `${year}-${month}-${day}`;
}

async function constructBoard(_date: string): Promise<ReadonlyArray<string>> {
  return getSrlV5Board(STANDARD);
}

async function getDailyBoard(date: string): Promise<ReadonlyArray<string>> {
  const sql = getSql();
  const sqlResult =
    await sql`SELECT board FROM daily WHERE date = ${date}`;
  const board: null | undefined | string = sqlResult?.[0]?.board;
  if (board != null) {
    return JSON.parse(board);
  }
  const newBoard = await constructBoard(date);
  await sql`INSERT INTO daily (
    date,
    board
  ) VALUES (
    ${date},
    ${JSON.stringify(newBoard)}
  );`;
  return newBoard;
}

export default async function DailyPage() {
  const today = getEasternISODate();
  const board = await getDailyBoard(today);
  return <Daily date={today} board={board} />
}
