import Dexie, { type EntityTable } from 'dexie';

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

const db = new Dexie('UFO50BingoDatabase') as Dexie & {
  attempts: EntityTable<AttemptRow, 'id'>;
  unselectedGoals: EntityTable<GoalSelectionRow, 'goal'>;
  playlist: EntityTable<PlaylistRow, 'id'>;
};

db.version(1).stores({
  attempts: '++id, goal, startTime, duration',
  unselectedGoals: 'goal',
  playlist: '++id, priority',
});

export type { Attempt, AttemptRow, PlaylistRow };
export { db };
