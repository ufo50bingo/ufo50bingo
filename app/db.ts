import Dexie, { type EntityTable } from "dexie";
import { NonStandardPracticeVariant, PracticeVariant } from "./PracticeVariantContext";

interface Attempt {
  goal: string;
  startTime: number;
  duration: number;
}

interface AttemptRow extends Attempt {
  id: number;
}

interface GoalSelectionRow {
  goal: string;
}

interface PlaylistRow {
  id: number;
  goal: string;
  priority: number;
}

interface CreatedMatchRow {
  id: string;
}

interface RevealedMatchRow {
  id: string;
}

interface DirectoryRow {
  id: number;
  handle: FileSystemDirectoryHandle;
}

export interface DailyFeedRow {
  id: number;
  time: number;
  date: string;
  variant: PracticeVariant;
  attempt: number;
  type: "mark" | "clear" | "reveal" | "pause" | "unpause";
  squareIndex: number | null;
}

export interface GameFilterRow {
  id: number;
  name: string;
  time: number;
  variant: string;
  filterJson: string;
}

const db = new Dexie("UFO50BingoDatabase") as Dexie & {
  attempts: EntityTable<AttemptRow, "id">;
  unselectedGoals: EntityTable<GoalSelectionRow, "goal">;
  playlist: EntityTable<PlaylistRow, "id">;
  createdMatches: EntityTable<CreatedMatchRow, "id">;
  revealedMatches: EntityTable<RevealedMatchRow, "id">;
  directory: EntityTable<DirectoryRow, "id">;
  dailyFeed: EntityTable<DailyFeedRow, "id">;
  gameFilters: EntityTable<GameFilterRow, "id">;
};

db.version(1).stores({
  attempts: "++id, goal, startTime, duration",
  unselectedGoals: "goal",
  playlist: "++id, priority",
  createdMatches: "id",
  revealedMatches: "id",
  directory: "++id",
  dailyFeed: "++id, [date+attempt]",
  gameFilters: "++id, variant",
});

db.version(2).stores({
  attempts: "++id, goal, startTime, duration",
  unselectedGoals: "goal",
  playlist: "++id, priority",
  createdMatches: "id",
  revealedMatches: "id",
  directory: "++id",
  dailyFeed: "++id, [date+attempt+variant]",
  gameFilters: "++id, variant",
}).upgrade(async (tx) => {
  await tx.table("attempts").toCollection().modify((attempt) => {
    attempt.variant = "standard";
  });
});

export type { Attempt, AttemptRow, PlaylistRow };
export { db };
