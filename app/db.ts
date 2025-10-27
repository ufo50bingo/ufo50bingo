import Dexie, { type EntityTable } from "dexie";

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
  attempt: number;
  type: "mark" | "clear" | "reveal" | "pause" | "unpause";
  squareIndex: number | null;
}

const db = new Dexie("UFO50BingoDatabase") as Dexie & {
  attempts: EntityTable<AttemptRow, "id">;
  unselectedGoals: EntityTable<GoalSelectionRow, "goal">;
  playlist: EntityTable<PlaylistRow, "id">;
  createdMatches: EntityTable<CreatedMatchRow, "id">;
  revealedMatches: EntityTable<RevealedMatchRow, "id">;
  directory: EntityTable<DirectoryRow, "id">;
  dailyFeed: EntityTable<DailyFeedRow, "id">;
};

db.version(1).stores({
  attempts: "++id, goal, startTime, duration",
  unselectedGoals: "goal",
  playlist: "++id, priority",
  createdMatches: "id",
  revealedMatches: "id",
  directory: "++id",
  dailyFeed: "++id, [date+attempt]",
});

export type { Attempt, AttemptRow, PlaylistRow };
export { db };
