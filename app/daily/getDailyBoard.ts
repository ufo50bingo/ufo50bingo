import { Metadata } from "next";
import { NeonQueryFunction } from "@neondatabase/serverless";
import getSql from "../getSql";
import { getPrevISODates, LocalDate, toISODate } from "./localDate";
import { isGift, isGoldCherry } from "./giftGoldCherry";
import { SPICY_UFO } from "../pastas/spicyUfo";
import ufoGenerator, { UFOPasta } from "../generator/ufoGenerator";
import { StandardGeneral } from "../pastas/pastaTypes";
import { getPracticePasta } from "../usePracticePasta";
import { PracticeVariant } from "../PracticeVariantContext";

export const DAILY_METADATA: Metadata = {
  title: "UFO 50 Daily Bingo",
  description: "Take on the daily UFO 50 Bingo board!",
};

export type DailyData = {
  board: ReadonlyArray<string>;
  seed: number;
  title: string | null | undefined;
  description: string | null | undefined;
  creator: string | null | undefined;
  variant: PracticeVariant;
};

const SPICY_WITHOUT_GENERAL: UFOPasta = {
  ...SPICY_UFO,
  category_counts: {
    easy: 5,
    medium: 7,
    hard: 8,
    veryhard: 5,
    general: 0,
  },
};

function isDateSunday(localDate: LocalDate): boolean {
  const date = new Date(`${toISODate(localDate)}T00:00:00`);
  return date.getDay() === 0;
}

async function constructBoard(
  date: LocalDate,
  variant: PracticeVariant,
  isSpicySunday: boolean,
): Promise<ReadonlyArray<string>> {
  const prevIsoDates = getPrevISODates(date, 7);
  const sqlResult = await getSql(false)`
    SELECT board
    FROM daily
    WHERE date = ANY (${prevIsoDates})
    AND variant = ${variant}
    ORDER BY date DESC;`;
  const recentBoards =
    sqlResult?.map((raw) => {
      const parsed: ReadonlyArray<string> = JSON.parse(raw.board);
      return parsed;
    }) ?? [];
  const pasta = isSpicySunday
    ? SPICY_WITHOUT_GENERAL
    : getPracticePasta(variant);
  let bestBoard = ufoGenerator(pasta, 5, 5);
  let bestScore = getSimilarityScore(bestBoard, recentBoards);
  for (let i = 0; i < 100; i++) {
    if (bestScore === 0) {
      return bestBoard;
    }
    const candidate = ufoGenerator(pasta, 5, 5);
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
    board.forEach((goal) => {
      if (!candidateGoals.has(goal)) {
        return;
      }
      const penalty =
        isGift(goal as StandardGeneral) || isGoldCherry(goal as StandardGeneral)
          ? GIFT_GOLD_CHERRY_PENALTY[boardIndex]
          : SIMILARITY_PENALTY[boardIndex];
      score += penalty;
    });
  });
  return score;
}

async function fetchSavedBoard(
  sql: NeonQueryFunction<false, false>,
  isoDate: string,
  variant: PracticeVariant,
): Promise<null | DailyData> {
  const sqlResult = await sql`
      SELECT
        board,
        title,
        description,
        creator,
        seed
      FROM daily
      WHERE
        date = ${isoDate}
        AND variant = ${variant}`;
  const board: null | undefined | string = sqlResult?.[0]?.board;
  const title: null | undefined | string = sqlResult?.[0]?.title;
  const description: null | undefined | string = sqlResult?.[0]?.description;
  const creator: null | undefined | string = sqlResult?.[0]?.creator;
  const seed: null | undefined | number = sqlResult?.[0]?.seed;
  if (board == null || seed == null) {
    return null;
  }
  const parsed = JSON.parse(board);
  return { board: parsed, title, description, creator, seed, variant };
}

export default async function getDailyBoard(
  date: LocalDate,
  variant: PracticeVariant,
): Promise<DailyData> {
  const isoDate = toISODate(date);
  // remove caching to try to fix runtime issue where pages are trying to save duplicate data into table
  const sql = getSql(false);
  const savedBoard = await fetchSavedBoard(sql, isoDate, variant);
  if (savedBoard != null) {
    return savedBoard;
  }
  const isSpicySunday = variant == "standard" && isDateSunday(date);
  const newBoard = await constructBoard(date, variant, isSpicySunday);
  const newTitle = isSpicySunday ? "Spicy Sunday" : null;
  const newDescription = isSpicySunday
    ? JSON.stringify({
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                marks: [
                  {
                    type: "link",
                    attrs: {
                      href: "https://docs.google.com/document/d/1Snf0qAm68dRROjoh8hb3Rn0OV-THyD2PcLJeuN-209U/edit?tab=t.0",
                      target: null,
                      rel: "noopener noreferrer nofollow",
                      class: null,
                    },
                  },
                ],
                text: "Follow the spicy bingo rules!",
              },
            ],
          },
        ],
      })
    : null;
  const newSeed = Math.ceil(999999 * Math.random());
  const inserted = await sql`INSERT INTO daily (
    date,
    board,
    title,
    description,
    seed,
    variant
  ) VALUES (
    ${isoDate},
    ${JSON.stringify(newBoard)},
    ${newTitle},
    ${newDescription},
    ${newSeed},
    ${variant}
  )
  ON CONFLICT DO NOTHING
  RETURNING date;`;
  if (inserted.length === 0) {
    // another render saved this day's board first, so use that instead
    const otherBoard = await fetchSavedBoard(sql, isoDate, variant);
    if (otherBoard == null) {
      throw new Error(`Could not save or load the daily board for ${isoDate}`);
    }
    return otherBoard;
  }
  return {
    board: newBoard,
    title: newTitle,
    description: newDescription,
    creator: null,
    seed: newSeed,
    variant,
  };
}
