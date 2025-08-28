"use server";

import { revalidatePath } from "next/cache";
import getCsrfData from "../getCsrfData";
import getSql from "../getSql";
import getSQl from "../getSql";
import {
  Board,
  Changelog,
  getBoard,
  getChangelogAndPlayers,
  PlayerToColors,
  RawBoard,
  RawFeed,
} from "./parseBingosyncData";
import {
  getFirstBingoPlayer,
  getIsValid,
  getPlayerWithLeastRecentClaim,
} from "./analyzeMatch";

type PlayerScores = { [name: string]: number };

export async function refreshMatch(id: string): Promise<void> {
  const [boardJson, feedJson] = await Promise.all([
    fetchBoard(id),
    fetchFeed(id),
  ]);
  const board = getBoard(boardJson);
  const [changelog, playerColors] = getChangelogAndPlayers(feedJson);

  const playerScores: PlayerScores = {};
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
    return await updateMatch(
      id,
      board,
      null,
      null,
      null,
      playerColors,
      playerScores,
      false
    );
  }

  const bingoPlayer = getFirstBingoPlayer(changelog["changes"], playerColors);
  if (bingoPlayer != null) {
    const bestOpponent =
      playerEntries.find(([name, _]) => name !== bingoPlayer)?.[0] ?? null;
    return await updateMatch(
      id,
      board,
      changelog,
      bingoPlayer,
      bestOpponent,
      playerColors,
      playerScores,
      true
    );
  }

  if (playerEntries.length === 1) {
    return await updateMatch(
      id,
      board,
      changelog,
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
    return await updateMatch(
      id,
      board,
      changelog,
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
  return await updateMatch(
    id,
    board,
    changelog,
    winnerName,
    opponentName,
    playerColors,
    playerScores,
    false
  );
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

async function updateMatch(
  id: string,
  board: Board,
  changelog: Changelog | null,
  winnerName: string | null,
  opponentName: string | null,
  players: PlayerToColors,
  scores: PlayerScores,
  bingo: boolean
): Promise<void> {
  const isAllBlank = board.every((square) => square.color === "blank");

  const sql = getSql(false);

  let winnerColor: null | string = null;
  let winnerScore: null | number = null;
  if (winnerName != null) {
    winnerColor = players[winnerName].join(" ");
    winnerScore = scores[winnerName];
  }

  let opponentColor: null | string = null;
  let opponentScore: null | number = null;
  if (opponentName != null) {
    opponentColor = players[opponentName].join(" ");
    opponentScore = scores[opponentName];
  }

  const changelogJson = changelog != null ? JSON.stringify(changelog) : null;

  await sql`UPDATE match
    SET
      winner_name = ${winnerName},
      winner_color = ${winnerColor},
      winner_score = ${winnerScore},
      winner_bingo = ${bingo},
      opponent_name = ${opponentName},
      opponent_color = ${opponentColor},
      opponent_score = ${opponentScore},
      board_json = ${JSON.stringify(board)},
      changelog_json = ${changelogJson},
      is_board_visible = ${!isAllBlank}
    WHERE id = ${id}`;
  revalidatePath("/matches");
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
