import getSql from "../getSql";
import {
  getColorWithLeastRecentClaim,
  getFirstBingoPlayer,
  getIsValid,
  getPlayerWithLeastRecentClaim,
  getVerifiedPlayerToColors,
} from "./analyzeMatch";
import { SQL } from "./page";
import {
  BingosyncColor,
  Changelog,
  getPlayerColors,
  PlayerToColors,
  TBoard,
} from "./parseBingosyncData";
import { PlayerScores } from "./refreshMatch";

type MatchResult = {
  winnerName: string;
  winnerColor: string;
  winnerScore: number;
  winnerBingo: boolean;
  opponentName: string | null;
  opponentColor: string | null;
  opponentScore: number | null;
};

export function getResultSql(result: null | MatchResult): SQL {
  return getSql()`
      winner_name = ${result?.winnerName ?? null},
      winner_color = ${result?.winnerColor ?? null},
      winner_score = ${result?.winnerScore ?? null},
      winner_bingo = ${result?.winnerBingo ?? false},
      opponent_name = ${result?.opponentName ?? null},
      opponent_color = ${result?.opponentColor ?? null},
      opponent_score = ${result?.opponentScore ?? null},
  `;
}

function getStandardResult(
  winnerName: string,
  opponentName: string | null,
  players: PlayerToColors,
  scores: PlayerScores,
  winnerBingo: boolean,
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

export function getTeamColors(
  board: TBoard,
  changelog: Changelog,
  leagueP1: string | null | undefined,
  leagueP2: string | null | undefined,
): PlayerToColors {
  const verifiedPlayerToColors = getVerifiedPlayerToColors(
    changelog.changes,
    leagueP1,
    leagueP2,
  );
  const playerColors =
    verifiedPlayerToColors ?? getPlayerColors(changelog.changes);
  // this is not a league match, and every player has exactly 1 color.
  // we can turn it into a team game
  if (
    verifiedPlayerToColors == null &&
    Object.keys(playerColors).length > 0 &&
    Object.keys(playerColors).every(
      (player) => playerColors[player].length === 1,
    )
  ) {
    const colorToPlayers: { [color: string]: string[] } = {};
    Object.keys(playerColors).forEach((player) => {
      const color = playerColors[player][0];
      const existing = colorToPlayers[color] ?? [];
      existing.push(player);
      colorToPlayers[color] = existing;
    });
    const teams: PlayerToColors = {};
    Object.keys(colorToPlayers).forEach((color) => {
      teams[colorToPlayers[color].join(" / ")] = [color as BingosyncColor];
    });
    return teams;
  }
  const teams: PlayerToColors = {};
  Object.keys(playerColors).forEach((player) => {
    teams[player] = playerColors[player];
  });
  return teams;
}

export function getTeamScores(
  board: TBoard,
  teamColors: PlayerToColors,
): PlayerScores {
  const teamScores: PlayerScores = {};
  Object.keys(teamColors).forEach((teamName) => {
    teamScores[teamName] = 0;
  });
  board.forEach((square) => {
    Object.keys(teamColors).forEach((teamName) => {
      if (teamColors[teamName].includes(square.color)) {
        const newScore = (teamScores[teamName] ?? 0) + 1;
        teamScores[teamName] = newScore;
      }
    });
  });
  return teamScores;
}

export function getResult(
  board: TBoard,
  changelog: Changelog,
  leagueP1: string | null | undefined,
  leagueP2: string | null | undefined,
): null | MatchResult {
  const teamColors = getTeamColors(board, changelog, leagueP1, leagueP2);
  const teamScores = getTeamScores(board, teamColors);
  const teamEntries = Object.entries(teamScores);
  // sort so that the team with the most goals is first
  teamEntries.sort((a, b) => b[1] - a[1]);

  const isValid = getIsValid(board, changelog["changes"]);
  if (!isValid || teamEntries.length === 0) {
    return null;
  }

  const bingoTeam = getFirstBingoPlayer(changelog["changes"], teamColors);
  if (bingoTeam != null) {
    const bestOpponent =
      teamEntries.find(([name, _]) => name !== bingoTeam)?.[0] ?? null;
    return getStandardResult(
      bingoTeam,
      bestOpponent,
      teamColors,
      teamScores,
      true,
    );
  }

  if (teamEntries.length === 1) {
    return getStandardResult(
      teamEntries[0][0],
      null,
      teamColors,
      teamScores,
      false,
    );
  }

  const bestScore = teamEntries[0][1];
  const secondBestScore = teamEntries[1][1];
  if (bestScore > secondBestScore) {
    return getStandardResult(
      teamEntries[0][0],
      teamEntries[1][0],
      teamColors,
      teamScores,
      false,
    );
  }

  const tiedTeams = teamEntries
    .filter((entry) => entry[1] === bestScore)
    .map((entry) => entry[0]);

  const tiedTeamToColors: PlayerToColors = {};
  tiedTeams.forEach((team) => {
    tiedTeamToColors[team] = teamColors[team];
  });
  // TODO: This is broken!! Fix to work with colors
  const winnerName = getPlayerWithLeastRecentClaim(
    changelog["changes"],
    tiedTeamToColors,
  );
  const opponentName = tiedTeams.find((team) => team !== winnerName) ?? null;
  return getStandardResult(
    winnerName,
    opponentName,
    teamColors,
    teamScores,
    false,
  );
}
