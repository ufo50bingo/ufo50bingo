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

export function getResult(
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

  // TODO: Add 0 scores for league matches
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
