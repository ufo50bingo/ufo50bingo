"use server";

import { revalidatePath } from "next/cache";
import getCsrfData from "../getCsrfData";
import getSql from "../getSql";
import getSQl from "../getSql";
import {
  TBoard,
  Changelog,
  getBoard,
  PlayerToColors,
  RawBoard,
  RawFeed,
  BingosyncColor,
  getChangelog,
  getPlayerColors,
} from "./parseBingosyncData";
import {
  getColorWithLeastRecentClaim,
  getFirstBingoPlayer,
  getIsValid,
  getPlayerWithLeastRecentClaim,
  getVerifiedPlayerToColors,
} from "./analyzeMatch";
import syncToGSheet from "./syncToGSheet";
import { getMatchFromRaw, MATCH_FIELDS } from "./getMatchFromRaw";
import { SQL } from "./page";

export type PlayerScores = { [name: string]: number };

type ExistingMatch = {
  leagueP1: string | null | undefined;
  leagueP2: string | null | undefined;
  board: TBoard;
  changelog: Changelog;
};
async function fetchExistingMatch(id: string): Promise<ExistingMatch> {
  const sql = getSQl();
  const result = await sql`
    SELECT
      league_p1,
      league_p2,
      board_json,
      changelog_json
    FROM match
    WHERE id = ${id}
  `;
  const boardJson = result?.[0]?.board_json;
  const changelogJson = result?.[0]?.changelog_json;
  const board = boardJson != null ? JSON.parse(boardJson) : null;
  const changelog = changelogJson != null ? JSON.parse(changelogJson) : null;
  return {
    leagueP1: result?.[0]?.league_p1,
    leagueP2: result?.[0]?.league_p2,
    board,
    changelog,
  };
}

function areBoardsEqual(a: TBoard, b: TBoard): boolean {
  for (let i = 0; i < 25; i++) {
    const aSquare = a[i];
    const bSquare = b[i];
    if (aSquare.color !== bSquare.color || aSquare.name !== bSquare.name) {
      return false;
    }
  }
  return true;
}

function almostEqual(a: number, b: number): boolean {
  return Math.abs(a - b) < 0.1;
}

function areChangelogsEqual(a: Changelog, b: Changelog): boolean {
  const aRev = a.reveals;
  const bRev = b.reveals;
  if (aRev.length !== bRev.length) {
    return false;
  }
  for (let i = 0; i < aRev.length; i++) {
    if (
      aRev[i].name !== bRev[i].name ||
      !almostEqual(aRev[i].time, bRev[i].time)
    ) {
      return false;
    }
  }

  const aChanges = a.changes;
  const bChanges = b.changes;

  if (aChanges.length !== bChanges.length) {
    return false;
  }
  for (let i = 0; i < aChanges.length; i++) {
    const aChange = aChanges[i];
    const bChange = bChanges[i];
    if (
      aChange.color !== bChange.color ||
      aChange.name !== bChange.name ||
      aChange.index !== bChange.index ||
      !almostEqual(aChange.time, bChange.time)
    ) {
      return false;
    }
  }
  return true;
}

export async function refreshMatch(id: string): Promise<void> {
  const [
    boardJson,
    feedJson,
    { leagueP1, leagueP2, board: existingBoard, changelog: existingChangelog },
  ] = await Promise.all([
    fetchBoard(id),
    fetchFeed(id),
    fetchExistingMatch(id),
  ]);
  const board = getBoard(boardJson);
  const changelog = getChangelog(feedJson);

  if (
    existingBoard != null &&
    existingChangelog != null &&
    areBoardsEqual(existingBoard, board) &&
    areChangelogsEqual(existingChangelog, changelog)
  ) {
    return;
  }

  const result = getResult(board, changelog, leagueP1, leagueP2);
  const isAllBlank = board.every((square) => square.color === "blank");

  const changelogJson = changelog != null ? JSON.stringify(changelog) : null;
  const changes = changelog?.changes;
  const lastColorTime =
    changes != null && changes.length > 0
      ? changes[changes.length - 1].time
      : null;

  const sql = getSql(false);
  const sqlResult = await sql`
    UPDATE match
    SET
      ${getResultSql(result)},
      board_json = ${JSON.stringify(board)},
      changelog_json = ${changelogJson},
      is_board_visible = ${!isAllBlank},
      last_refreshed = CURRENT_TIMESTAMP,
      last_color_time = TO_TIMESTAMP(${lastColorTime})
    WHERE id = ${id}
    RETURNING ${MATCH_FIELDS}`;

  revalidatePath("/matches");
  revalidatePath(`/match/${id}`);
  try {
    const rawMatch = sqlResult[0];
    const match = getMatchFromRaw(rawMatch);
    await syncToGSheet(match);
  } catch {}
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

type MatchResult = {
  winnerName: string;
  winnerColor: string;
  winnerScore: number;
  winnerBingo: boolean;
  opponentName: string | null;
  opponentColor: string | null;
  opponentScore: number | null;
};

function getResultSql(result: null | MatchResult): SQL {
  return getSQl()`
      winner_name = ${result?.winnerName},
      winner_color = ${result?.winnerColor},
      winner_score = ${result?.winnerScore},
      winner_bingo = ${result?.winnerBingo ?? false},
      opponent_name = ${result?.opponentName},
      opponent_color = ${result?.opponentColor},
      opponent_score = ${result?.opponentScore}
  `;
}

function getStandardResult(
  winnerName: string,
  opponentName: string | null,
  players: PlayerToColors,
  scores: PlayerScores,
  winnerBingo: boolean
): MatchResult {
  const winnerColor = players[winnerName].join(" ");
  const winnerScore = scores[winnerName];

  let opponentColor: null | string = null;
  let opponentScore: null | number = null;
  if (opponentName != null) {
    opponentColor = players[opponentName].join(" ");
    opponentScore = scores[opponentName];
  }

  return {
    winnerName,
    winnerColor,
    winnerScore,
    winnerBingo,
    opponentName,
    opponentColor,
    opponentScore,
  };
}

function getResult(
  board: TBoard,
  changelog: Changelog,
  leagueP1: string | null | undefined,
  leagueP2: string | null | undefined
): null | MatchResult {
  const verifiedPlayerToColors = getVerifiedPlayerToColors(
    changelog.changes,
    leagueP1,
    leagueP2
  );
  const playerColors =
    verifiedPlayerToColors ?? getPlayerColors(changelog.changes);
  const playerScores: PlayerScores = {};
  if (verifiedPlayerToColors != null) {
    // initialize to 0 in case this player didn't actually score a point
    Object.keys(verifiedPlayerToColors).forEach((verifiedPlayer) => {
      playerScores[verifiedPlayer] = 0;
    });
  }
  board.forEach((square) => {
    Object.keys(playerColors).map((name) => {
      if (playerColors[name].includes(square.color)) {
        const newScore = (playerScores[name] ?? 0) + 1;
        playerScores[name] = newScore;
      }
    });
  });
  const playerEntries = Object.entries(playerScores);
  // sort so that the player with the most goals is first
  playerEntries.sort((a, b) => b[1] - a[1]);

  const isValid = getIsValid(board, changelog["changes"]);
  if (!isValid || playerEntries.length === 0) {
    return null;
  }

  const bingoPlayer = getFirstBingoPlayer(changelog["changes"], playerColors);
  if (verifiedPlayerToColors == null && Object.keys(playerColors).length > 0) {
    // if each player has exactly 1 color
    if (
      Object.keys(playerColors).every(
        (player) => playerColors[player].length === 1
      )
    ) {
      const colorToPlayers: { [color: string]: string[] } = {};
      Object.keys(playerColors).forEach((player) => {
        const color = playerColors[player][0];
        const existing = colorToPlayers[color] ?? [];
        existing.push(player);
        colorToPlayers[color] = existing;
      });
      if (
        Object.keys(colorToPlayers).every(
          (color) => colorToPlayers[color].length > 1
        )
      ) {
        // it's probably a team game
        const colorScores: { [color: string]: number } = {};
        board.forEach((square) => {
          if (square.color === "blank") {
            return;
          }
          const existingCount = colorScores[square.color] ?? 0;
          colorScores[square.color] = existingCount + 1;
        });
        const colorEntries = Object.entries(colorScores);
        // sort so that the color with the most goals is first
        colorEntries.sort((a, b) => b[1] - a[1]);
        if (bingoPlayer != null) {
          const bingoColor = playerColors[bingoPlayer][0];
          const bestOpponentColor =
            colorEntries.find(([color, _]) => color !== bingoColor)?.[0] ??
            null;
          return {
            winnerName: colorToPlayers[bingoColor].join(" / "),
            winnerColor: bingoColor,
            winnerScore: colorScores[bingoColor],
            winnerBingo: true,
            opponentName:
              bestOpponentColor != null
                ? colorToPlayers[bestOpponentColor].join(" / ")
                : null,
            opponentColor: bestOpponentColor,
            opponentScore:
              bestOpponentColor != null ? colorScores[bestOpponentColor] : null,
          };
        }
        if (colorEntries.length === 1) {
          return {
            winnerName: colorToPlayers[colorEntries[0][0]].join(" / "),
            winnerColor: colorEntries[0][0],
            winnerScore: colorScores[colorEntries[0][0]],
            winnerBingo: false,
            opponentName: null,
            opponentColor: null,
            opponentScore: null,
          };
        }
        const bestScore = colorEntries[0][1];
        const secondBestScore = colorEntries[1][1];
        if (bestScore > secondBestScore) {
          return {
            winnerName: colorToPlayers[colorEntries[0][0]].join(" / "),
            winnerColor: colorEntries[0][0],
            winnerScore: colorScores[colorEntries[0][0]],
            winnerBingo: false,
            opponentName: colorToPlayers[colorEntries[1][0]].join(" / "),
            opponentColor: colorEntries[1][0],
            opponentScore: colorScores[colorEntries[1][0]],
          };
        }
        const tiedColors = colorEntries
          .filter((entry) => entry[1] === bestScore)
          .map((entry) => entry[0]);
        const winningColor = getColorWithLeastRecentClaim(
          changelog["changes"],
          tiedColors as unknown as BingosyncColor[]
        );
        const opponentColor: BingosyncColor = tiedColors.find(
          (player) => player !== winnerName
        ) as unknown as BingosyncColor;
        return {
          winnerName: colorToPlayers[winningColor].join(" / "),
          winnerColor: winningColor,
          winnerScore: colorScores[winningColor],
          winnerBingo: false,
          opponentName: colorToPlayers[opponentColor].join(" / "),
          opponentColor: opponentColor,
          opponentScore: colorScores[opponentColor],
        };
      }
    }
  }

  if (bingoPlayer != null) {
    const bestOpponent =
      playerEntries.find(([name, _]) => name !== bingoPlayer)?.[0] ?? null;
    return getStandardResult(
      bingoPlayer,
      bestOpponent,
      playerColors,
      playerScores,
      true
    );
  }

  if (playerEntries.length === 1) {
    return getStandardResult(
      playerEntries[0][0],
      null,
      playerColors,
      playerScores,
      false
    );
  }

  const bestScore = playerEntries[0][1];
  const secondBestScore = playerEntries[1][1];
  if (bestScore > secondBestScore) {
    return getStandardResult(
      playerEntries[0][0],
      playerEntries[1][0],
      playerColors,
      playerScores,
      false
    );
  }

  const tiedPlayers = playerEntries
    .filter((entry) => entry[1] === bestScore)
    .map((entry) => entry[0]);

  const tiedPlayerToColors: PlayerToColors = {};
  tiedPlayers.forEach((player) => {
    tiedPlayerToColors[player] = playerColors[player];
  });
  const winnerName = getPlayerWithLeastRecentClaim(
    changelog["changes"],
    tiedPlayerToColors
  );
  const opponentName =
    tiedPlayers.find((player) => player !== winnerName) ?? null;
  return getStandardResult(
    winnerName,
    opponentName,
    playerColors,
    playerScores,
    false
  );
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
  const feedJson: RawFeed = await feedResponse.json();
  return feedJson;
}
