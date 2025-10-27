
import getSrlV5Board from "./getSrlV5Board";
import { STANDARD } from "../pastas/standard";
import getSql from "../getSql";
import Daily from "./Daily";
import { getPrevISODates, LocalDate, toISODate } from "./localDate";
import { isGift, isGoldCherry } from "./giftGoldCherry";
import { GoalName } from "../goals";

export const dynamic = "force-dynamic";

function getEasternDate(): LocalDate {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
  });
  const parts = formatter.formatToParts(new Date());
  let month = 1;
  let day = 1;
  let year = 1970;
  parts.forEach(part => {
    if (part.type === "month") {
      month = Number(part.value);
    } else if (part.type === "day") {
      day = Number(part.value);
    } else if (part.type === "year") {
      year = Number(part.value);
    }
  });
  return { year, month, day };
}

async function constructBoard(date: LocalDate): Promise<ReadonlyArray<string>> {
  const prevIsoDates = getPrevISODates(date, 7);
  const sqlResult = await getSql(false)`
    SELECT board
    FROM daily
    WHERE date = ANY (${prevIsoDates})
    ORDER BY date DESC;`;
  const recentBoards = sqlResult?.map(raw => {
    const parsed: ReadonlyArray<string> = JSON.parse(raw.board);
    return parsed;
  }) ?? [];
  let bestBoard = getSrlV5Board(STANDARD);
  let bestScore = getSimilarityScore(bestBoard, recentBoards);
  for (let i = 0; i < 100; i++) {
    if (bestScore === 0) {
      return bestBoard;
    }
    const candidate = getSrlV5Board(STANDARD);
    const score = getSimilarityScore(candidate, recentBoards);
    if (score < bestScore) {
      bestBoard = candidate;
      bestScore = score;
    }
  }
  return bestBoard;
}

const SIMILARITY_PENALTY = [12, 7, 5, 4, 3, 2, 1];
const GIFT_GOLD_CHERRY_PENALTY = [3, 2, 1, 1, 1, 1, 1];
function getSimilarityScore(
  candidate: ReadonlyArray<string>,
  prevBoards: ReadonlyArray<ReadonlyArray<string>>,
): number {
  let score = 0;
  const candidateGoals = new Set(candidate);
  prevBoards.forEach((board, boardIndex) => {
    board.forEach(goal => {
      if (!candidateGoals.has(goal)) {
        return;
      }
      const penalty = isGift(goal as GoalName) || isGoldCherry(goal as GoalName)
        ? GIFT_GOLD_CHERRY_PENALTY[boardIndex]
        : SIMILARITY_PENALTY[boardIndex];
      score += penalty;
    });
  });
  return score;
}

async function getDailyBoard(date: LocalDate): Promise<ReadonlyArray<string>> {
  const isoDate = toISODate(date);
  const sql = getSql(false);
  const sqlResult =
    await sql`SELECT board FROM daily WHERE date = ${isoDate}`;
  const board: null | undefined | string = sqlResult?.[0]?.board;
  if (board != null) {
    return JSON.parse(board);
  }
  const newBoard = await constructBoard(date);
  await sql`INSERT INTO daily (
    date,
    board
  ) VALUES (
    ${isoDate},
    ${JSON.stringify(newBoard)}
  );`;
  return newBoard;
}

export default async function DailyPage() {
  const date = getEasternDate();
  const board = await getDailyBoard(date);
  return <Daily date={date} board={board} />
}
