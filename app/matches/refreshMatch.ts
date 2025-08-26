"use server";

import getCsrfData from "../getCsrfData";
import getSQl from "../getSql";
import { Match } from "./Matches";

type BingosyncColor =
  | "blank"
  | "red"
  | "blue"
  | "green"
  | "orange"
  | "purple"
  | "navy"
  | "teal"
  | "pink"
  | "brown"
  | "yellow";

type RawSquare = [
  {
    // goal text
    name: string;
    // string like slot1, slot2, ..., slot25
    // not needed. First slot is always first in the array
    slot: string;
    // colors that have marked this square
    // if not lockout, colors are separated by spaces
    colors: string;
  }
];
type RawBoard = ReadonlyArray<RawSquare>;

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
};
type RawColor = {
  type: "color";
};
type RawRevealed = {
  type: "revealed";
};
type RawConnection = {
  type: "connection";
};
// "other" is NEVER ACTUALLY USED BY BINGOSYNC
// just including here so the types help us not crash in case
// bingosync adds new event types in the future
type RawOther = {
  type: "other";
};
type RawFeedItem =
  | RawNewCard
  | RawGoal
  | RawChat
  | RawColor
  | RawRevealed
  | RawConnection
  | RawOther;
type RawFeed = {
  events: ReadonlyArray<RawFeedItem>;
  allIncluded: boolean;
};

export async function refreshMatch(id: string): Promise<void> {
  const [boardJson, feedJson] = await Promise.all([
    fetchBoard(id),
    fetchFeed(id),
  ]);
  console.log(boardJson);
  console.log(feedJson);
}

async function fetchBoard(id: string): Promise<string> {
  const boardResult = await fetch(
    `https://www.bingosync.com/room/${id}/board`,
    {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return await boardResult.json();
}

async function fetchFeed(id: string): Promise<RawFeed> {
  const roomURL = `https://www.bingosync.com/room/${id}`;

  const sql = getSQl();
  const [{ cookie, token }, sqlResult] = await Promise.all([
    getCsrfData(),
    sql`SELECT name, password FROM match WHERE id = ${id}`,
  ]);
  const name: null | void | string = sqlResult?.[0]?.name;
  const password: null | void | string = sqlResult?.[0]?.password;

  if (password == null || name == null) {
    throw new Error(`No name or password found for match ${id}`);
  }

  const roomResponse = await fetch(roomURL, {
    method: "POST",
    redirect: "manual",
    credentials: "include",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Cookie: cookie,
    },
    body: new URLSearchParams({
      csrfmiddlewaretoken: token,
      encoded_room_uuid: id,
      room_name: name,
      creator_name: "ufo50bingobot",
      game_name: "Custom (Advanced) - SRL v5",
      player_name: "ufo50bingobot",
      passphrase: password,
      is_spectator: "on",
    }).toString(),
  });

  const sessionCookie = roomResponse.headers.get("Set-Cookie");
  if (sessionCookie == null) {
    throw new Error(`Failed to fetch session cookie for id ${id}`);
  }

  const feedResponse = await fetch(`${roomURL}/feed`, {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Cookie: `${cookie}; ${sessionCookie}`,
    },
    body: new URLSearchParams({
      full: "true",
    }).toString(),
  });
  const feedJson: RawFeed = await await feedResponse.json();
  return feedJson;
}

function getGoalEventsForLatestCard(feedJson: RawFeed): ReadonlyArray<RawGoal> {
  const events = feedJson.events;
  // if no new-card event is found, findLastIndex returns -1
  // So adding 1 here does make sense in all cases
  const indexAfterFinalNewCard =
    events.findLastIndex((item) => item.type === "new-card") + 1;
  return events
    .slice(indexAfterFinalNewCard)
    .filter((event) => event.type === "goal");
}

type PlayerToColors = { [name: string]: ReadonlyArray<BingosyncColor> };
function getPlayerColors(goals: ReadonlyArray<RawGoal>): PlayerToColors {
  const playerToNetAdditions: { [name: string]: number } = {};
  const playerToColors: PlayerToColors = {};
  goals.forEach((goal) => {
    if (goal.player.is_spectator) {
      return;
    }
    const name = goal.player.name;

    const netAdditions = playerToNetAdditions[name] ?? 0;
    playerToNetAdditions[name] = goal.remove
      ? netAdditions - 1
      : netAdditions + 1;

    const color = goal.player.color;
    const colors = playerToColors[name] ?? [];
    if (!colors.includes(color)) {
      playerToColors[name] = [...colors, color];
    }
  });

  // if removals >= marks, then the player is likely
  // a ref/streamer instead of a participant
  Object.keys(playerToNetAdditions).forEach((name) => {
    const netAdditions = playerToNetAdditions[name];
    if (netAdditions <= 0) {
      delete playerToColors[name];
    }
  });
  return playerToColors;
}
