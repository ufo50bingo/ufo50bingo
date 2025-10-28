
import getSrlV5Board from "./getSrlV5Board";
import { STANDARD } from "../pastas/standard";
import getSql from "../getSql";
import { fromISODate, getPrevISODates, LocalDate, toISODate } from "./localDate";
import { isGift, isGoldCherry } from "./giftGoldCherry";
import { GoalName } from "../goals";
import DailyFeedFetcher from "./DailyFeedFetcher";
import { SPICY } from "../pastas/spicy";

export const dynamic = "force-dynamic";

type FilterParams = {
  date?: string;
};

export type DailyData = {
  board: ReadonlyArray<string>,
  title: string | null | undefined,
  description: string | null | undefined,
  creator: string | null | undefined,
};

function isDateSunday(localDate: LocalDate): boolean {
  const date = new Date(`${toISODate(localDate)}T00:00:00`);
  console.log(date.getDay());
  return date.getDay() === 0;
}

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

async function constructBoard(date: LocalDate, isSunday: boolean): Promise<ReadonlyArray<string>> {
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
  let bestBoard = getSrlV5Board(isSunday ? SPICY : STANDARD);
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

async function getDailyBoard(date: LocalDate): Promise<DailyData> {
  const isoDate = toISODate(date);
  const sql = getSql(false);
  const sqlResult =
    await sql`
      SELECT
        board,
        title,
        description,
        creator
      FROM daily
      WHERE date = ${isoDate}`;
  const board: null | undefined | string = sqlResult?.[0]?.board;
  const title: null | undefined | string = sqlResult?.[0]?.title;
  const description: null | undefined | string = sqlResult?.[0]?.description;
  const creator: null | undefined | string = sqlResult?.[0]?.creator;
  if (board != null) {
    const parsed = JSON.parse(board);
    return { board: parsed, title, description, creator };
  }
  const isSunday = isDateSunday(date);
  const newBoard = await constructBoard(date, isSunday);
  const newTitle = isSunday ? 'Spicy Sunday' : null;
  await sql`INSERT INTO daily (
    date,
    board,
    title
  ) VALUES (
    ${isoDate},
    ${JSON.stringify(newBoard)},
    ${newTitle}
  );`;
  return {
    board: newBoard,
    title: newTitle,
    description: null,
    creator: null,
  };
}

export default async function DailyPage(props: {
  searchParams?: Promise<FilterParams>;
}) {
  const params = await props.searchParams;
  const dateParam = params?.date;
  const date = dateParam == null
    ? getEasternDate()
    : fromISODate(dateParam);
  const dailyData = await getDailyBoard(date);
  return <DailyFeedFetcher date={date} dailyData={dailyData} />
}
