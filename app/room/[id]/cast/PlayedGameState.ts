import {
  FeedCurrentSubcategory,
  FeedTimerEvent,
  NewFeed,
  NewFeedItem,
} from "@/app/fetchFeed";

interface BasePlayedGame {
  subcategoryId: number;
}
interface RunningGame extends BasePlayedGame {
  type: "running";
  effectiveStartTime: number;
}
interface PausedGame extends BasePlayedGame {
  type: "paused";
  duration: number;
}
interface FinishedGame extends BasePlayedGame {
  type: "finished";
  duration: number;
}
export type TPlayedGame = RunningGame | PausedGame | FinishedGame;

export default class PlayedGameState {
  playerToGames: Map<number, Array<TPlayedGame>>;
  hasStarted: boolean;
  isPaused: boolean;

  constructor() {
    this.playerToGames = new Map();
    this.isPaused = false;
    this.hasStarted = false;
  }

  static fromFeed(feed: NewFeed): PlayedGameState {
    const state = new PlayedGameState();
    for (const item of feed) {
      state.apply(item);
    }
    return state;
  }

  getPlayedGames(userId: number): ReadonlyArray<TPlayedGame> {
    return this.playerToGames.get(userId) ?? [];
  }

  getActiveId(userId: number): null | number {
    const games = this.getPlayedGames(userId);
    if (games.length === 0) {
      return null;
    }
    const game = games[games.length - 1];
    if (game.type === "finished") {
      return null;
    }
    return game.subcategoryId;
  }

  getMostRecentId(userId: number): null | number {
    const games = this.getPlayedGames(userId);
    if (games.length === 0) {
      return null;
    }
    return games[games.length - 1].subcategoryId;
  }

  getAllActiveIds(): ReadonlyArray<{ userId: number; subcategoryId: number }> {
    const final: Array<{ userId: number; subcategoryId: number }> = [];
    for (const userId of this.playerToGames.keys()) {
      const subcategoryId = this.getActiveId(userId);
      if (subcategoryId != null) {
        final.push({ userId, subcategoryId });
      }
    }
    return final;
  }

  apply(item: NewFeedItem) {
    if (item.type === "current_subcategory") {
      this.applyCurrentSubcategory(item);
    } else if (item.type === "timer_event") {
      this.applyTimerEvent(item);
    }
  }

  applyCurrentSubcategory(item: FeedCurrentSubcategory) {
    // can't select games until the match has started
    if (!this.hasStarted) {
      return;
    }

    let gameArr = this.playerToGames.get(item.userId);
    if (gameArr == null) {
      gameArr = [];
      this.playerToGames.set(item.userId, gameArr);
    }

    const prevIdx = gameArr.length - 1;
    const prevEntry = prevIdx >= 0 ? gameArr[prevIdx] : null;
    // ignore duplicate entries
    if (
      prevEntry != null &&
      prevEntry.type !== "finished" &&
      item.subcategoryId === prevEntry.subcategoryId
    ) {
      return;
    }
    // we're ignoring duplicates, so we must end the previous entry if there
    // was one
    if (prevEntry != null) {
      switch (prevEntry.type) {
        case "finished":
          break;
        case "paused":
          gameArr[prevIdx] = {
            type: "finished",
            subcategoryId: prevEntry.subcategoryId,
            duration: prevEntry.duration,
          };
          break;
        case "running":
          gameArr[prevIdx] = {
            type: "finished",
            subcategoryId: prevEntry.subcategoryId,
            duration: item.time - prevEntry.effectiveStartTime,
          };
          break;
      }
    }

    if (item.subcategoryId == null) {
      return;
    }

    const newEntry: TPlayedGame = this.isPaused
      ? { type: "paused", duration: 0, subcategoryId: item.subcategoryId }
      : {
          type: "running",
          effectiveStartTime: item.time,
          subcategoryId: item.subcategoryId,
        };
    gameArr.push(newEntry);
  }

  applyPause(time: number) {
    if (this.isPaused) {
      return;
    }
    this.isPaused = true;

    for (const gameArr of this.playerToGames.values()) {
      const prevIdx = gameArr.length - 1;
      if (prevIdx < 0) {
        continue;
      }
      const prevEntry = gameArr[prevIdx];
      if (prevEntry.type === "running") {
        const duration = time - prevEntry.effectiveStartTime;
        gameArr[prevIdx] = {
          type: "paused",
          subcategoryId: prevEntry.subcategoryId,
          duration,
        };
      }
    }
  }

  applyStart(time: number) {
    this.hasStarted = true;
    if (!this.isPaused) {
      return;
    }
    this.isPaused = false;

    for (const gameArr of this.playerToGames.values()) {
      const prevIdx = gameArr.length - 1;
      if (prevIdx < 0) {
        continue;
      }
      const prevEntry = gameArr[prevIdx];
      if (prevEntry.type === "paused") {
        const effectiveStartTime = time - prevEntry.duration;
        gameArr[prevIdx] = {
          type: "running",
          subcategoryId: prevEntry.subcategoryId,
          effectiveStartTime,
        };
      }
    }
  }

  applyTimerEvent(item: FeedTimerEvent) {
    switch (item.event) {
      case "set_duration":
        return;
      case "pause":
        this.applyPause(item.time);
        return;
      case "start":
        this.applyStart(item.time);
        return;
    }
  }
}
