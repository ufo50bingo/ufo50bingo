"use server";

import { revalidatePath } from "next/cache";
import getCsrfData from "../getCsrfData";
import getSql from "../getSql";
import getSQl from "../getSql";
import { Match } from "./Matches";

export type BingosyncColor =
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

type RawSquare = {
  // goal text
  name: string;
  // string like slot1, slot2, ..., slot25
  // not needed. First slot is always first in the array
  // slot is always included from bingosync API, but
  // marked optional here so we can reuse the type
  // more easily
  slot?: string;
  // colors that have marked this square
  // if not lockout, colors are separated by spaces
  colors: string;
};
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

type PlayerScores = { [name: string]: number };

export async function refreshMatch(id: string): Promise<void> {
  const [boardJson, feedJson] = await Promise.all([
    fetchBoard(id),
    fetchFeed(id),
  ]);
  const goalEvents = getGoalEventsForLatestCard(feedJson);
  const playerColors = getPlayerColors(goalEvents);

  const playerScores: PlayerScores = {};
  boardJson.forEach((square) => {
    const colors = square.colors.split(" ") as ReadonlyArray<BingosyncColor>;
    colors.forEach((color) => {
      Object.keys(playerColors).map((name) => {
        if (playerColors[name].includes(color)) {
          const newScore = (playerScores[name] ?? 0) + 1;
          playerScores[name] = newScore;
        }
      });
    });
  });

  const playerEntries = Object.entries(playerScores);
  // sort so that the player with the most goals is first
  playerEntries.sort((a, b) => b[1] - a[1]);

  const [p1_name, p1_score] = playerEntries[0];
  const p1_color = playerColors[p1_name].join(" ");
  let p2_name = null;
  let p2_score = null;
  let p2_color = null;
  if (playerEntries.length > 1) {
    [p2_name, p2_score] = playerEntries[1];
    p2_color = playerColors[p2_name].join(" ");
  }

  const sql = getSql();
  await sql`UPDATE match
    SET
      p1_name = ${p1_name},
      p1_color = ${p1_color},
      p1_score = ${p1_score},
      p2_name = ${p2_name},
      p2_color = ${p2_color},
      p2_score = ${p2_score},
      board_json = ${JSON.stringify(boardJson)}
    WHERE id = ${id}`;
  revalidatePath("/matches");
}

async function fetchBoard(id: string): Promise<RawBoard> {
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

  const url = new URL(`${roomURL}/feed`);
  url.search = new URLSearchParams({
    full: "true",
  }).toString();

  const feedResponse = await fetch(url, {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Cookie: `${cookie}; ${sessionCookie}`,
    },
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

    // use goal.player_color since it's the color the player *was*
    // at the time they marked the suare. The player object has
    // their *current color* instead
    const color = goal.player_color;
    console.log(name, color);
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
