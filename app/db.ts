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

const db = new Dexie("UFO50BingoDatabase") as Dexie & {
  attempts: EntityTable<AttemptRow, "id">;
  unselectedGoals: EntityTable<GoalSelectionRow, "goal">;
  playlist: EntityTable<PlaylistRow, "id">;
  createdMatches: EntityTable<CreatedMatchRow, "id">;
  revealedMatches: EntityTable<RevealedMatchRow, "id">;
};

db.version(1).stores({
  attempts: "++id, goal, startTime, duration",
  unselectedGoals: "goal",
  playlist: "++id, priority",
  createdMatches: "id",
  revealedMatches: "id",
});

export type { Attempt, AttemptRow, PlaylistRow };
export { db };
