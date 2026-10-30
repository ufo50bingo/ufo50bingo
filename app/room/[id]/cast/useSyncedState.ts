// IMPORTANT: Must update useFullGeneralState parser if this changes
export type CountState = { [userId: number]: PlayerCountState };
type PlayerCountState = { [subcategory: string]: number };

export interface CountChange {
  goal: string;
  userId: number;
  game: string;
  count: number;
}

export interface CurrentGame {
  game: null | string;
  start_time: number;
}

export type AllPlayerGames = Map<number, ReadonlyArray<CurrentGame>>;
