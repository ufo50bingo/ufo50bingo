// TODO: None of this file should be needed anymore
import { BingosyncColor } from "../color";

type RawSquare = {
  // goal text
  name: string;
  // string like slot1, slot2, ..., slot25
  // Not needed when fetching the board, because the squares
  // are always ordered by slot, but it is needed in the feed.
  slot: string;
  // color of the square. Can have multiple colors joined by
  // space if non-Lockout (but we only support Lockout)
  colors: BingosyncColor;
};
export type RawBoard = ReadonlyArray<RawSquare>;

export type Square = {
  name: string;
  color: BingosyncColor | null;
};

export type Change = {
  // unixtime in seconds
  time: number;
  // 0-24 index of square being changed
  index: number;
  name: string;
  color: BingosyncColor;
};

type Reveal = {
  time: number;
  name: string;
};

export type Changelog = {
  reveals: ReadonlyArray<Reveal>;
  changes: ReadonlyArray<Change>;
};

// all events https://github.com/kbuzsaki/bingosync/blob/main/bingosync-app/bingosync/models/events.py#L33
type RawPlayer = {
  uuid: string;
  name: string;
  color: BingosyncColor;
  is_spectator: boolean;
};
type RawNewCard = {
  type: "new-card";
  player: RawPlayer;
  player_color: BingosyncColor;
  game: string;
  seed: number;
  // whether the card is hidden by default
  hide_card: boolean;
  // whether the card is the most recent one
  // will change over time!
  is_current: boolean;
  timestamp: number;
};
type RawGoal = {
  type: "goal";
  // `player` and `square` seem to have values from AFTER the change was made. So if a square is
  // marked, `square` will contain the *new* color
  player: RawPlayer;
  square: RawSquare;
  // `player_color` and `color` seem to always be the same for "goal" items.
  // appears that `player_color` is used to color the name of the player in the chat entry,
  // and `color` is the color of other text
  // for color change events, `player_color` is the *old* color and `color` is the *new* color
  player_color: BingosyncColor;
  color: BingosyncColor;
  remove: boolean;
  timestamp: number;
};
type RawChat = {
  type: "chat";
  player: RawPlayer;
  player_color: BingosyncColor;
  text: string;
  timestamp: number;
};
type RawColor = {
  type: "color";
  player: RawPlayer;
  player_color: BingosyncColor;
  color: BingosyncColor;
  timestamp: number;
};
type RawRevealed = {
  type: "revealed";
  player: RawPlayer;
  player_color: BingosyncColor;
  timestamp: number;
};
type RawConnection = {
  type: "connection";
  event_type: "connected" | "disconnected";
  player: RawPlayer;
  player_color: BingosyncColor;
  timestamp: number;
};
// "other" is NEVER ACTUALLY USED BY BINGOSYNC
// just including here so the types help us not crash in case
// bingosync adds new event types in the future
type RawOther = {
  type: "other";
  player: RawPlayer;
  player_color: BingosyncColor;
  timestamp: number;
};
type RawFeedItem =
  | RawNewCard
  | RawGoal
  | RawChat
  | RawColor
  | RawRevealed
  | RawConnection
  | RawOther;
export type RawFeed = {
  events: ReadonlyArray<RawFeedItem>;
  allIncluded: boolean;
};

export type TBoard = ReadonlyArray<Square>;

export function getBoard(board: RawBoard): TBoard {
  return board.map((rawSquare) => ({
    name: rawSquare.name,
    color: rawSquare.colors,
  }));
}

export function getChangelog(feed: RawFeed): Changelog {
  const events = feed.events;
  // if no new-card event is found, findLastIndex returns -1
  // So adding 1 here does make sense in all cases
  const indexAfterFinalNewCard =
    events.findLastIndex((item) => item.type === "new-card") + 1;
  const relevantEvents = events.slice(indexAfterFinalNewCard);

  const changes = getChanges(relevantEvents);
  const playerColors = getPlayerColors(changes);
  const playerNames = Object.keys(playerColors);
  const reveals = getReveals(relevantEvents, playerNames);

  return { reveals, changes };
}

function getReveals(
  relevantEvents: ReadonlyArray<RawFeedItem>,
  playerNames: ReadonlyArray<string>,
): ReadonlyArray<Reveal> {
  const finalReveals: Reveal[] = [];
  const seenPlayers: string[] = [];
  relevantEvents.forEach((event) => {
    if (event.type !== "revealed") {
      return;
    }
    const name = event.player.name;
    if (!playerNames.includes(name) || seenPlayers.includes(name)) {
      return;
    }
    seenPlayers.push(name);
    finalReveals.push({
      time: event.timestamp,
      name,
    });
  });
  return finalReveals;
}

function getChanges(
  _relevantEvents: ReadonlyArray<RawFeedItem>,
): ReadonlyArray<Change> {
  // TODO: dead code
  return [];
}

export type PlayerToColors = { [name: string]: ReadonlyArray<BingosyncColor> };
export function getPlayerColors(
  _changes: ReadonlyArray<Change>,
): PlayerToColors {
  // TODO: dead code
  return {};
}
