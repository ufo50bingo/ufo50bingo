import { useMemo } from "react";
import { BingosyncColor, Change, Square, TBoard } from "./parseBingosyncData";
import { getChangesWithoutMistakes } from "./analyzeMatch";
import getOverlays from "./getOverlays";
import Board from "../Board";
import {
  getResultForTeams,
  getTeamColors,
  getTeamScores,
  MatchResult,
} from "./computeResult";
import { Group, Text } from "@mantine/core";
import BingosyncColored from "./BingosyncColored";
import { db } from "../db";

type Props = {
  finalBoard: TBoard;
  changes: ReadonlyArray<Change>;
  startTime: number;
  seekMs: number;
  leagueP1: string | null | undefined;
  leagueP2: string | null | undefined;
  isRevealed: boolean;
  matchId: string;
  isBoardVisible: boolean;
  showOverlays: boolean;
};

export default function InProgressBoard({
  changes,
  finalBoard,
  seekMs,
  startTime,
  leagueP1,
  leagueP2,
  isRevealed,
  matchId,
  isBoardVisible,
  showOverlays,
}: Props) {
  const curTime = startTime + seekMs;
  const endIndex = useMemo(() => {
    const endIndex = changes.findIndex((change) => change.time > curTime);
    return endIndex < 0 ? changes.length + 1 : endIndex;
  }, [changes, curTime]);
  const isFinal = endIndex === changes.length + 1;
  const trimmedChanges = useMemo(
    () => changes.slice(0, endIndex),
    [changes, endIndex],
  );
  const noMistakes = useMemo(
    () => getChangesWithoutMistakes(trimmedChanges),
    [trimmedChanges],
  );
  const board: TBoard = useMemo(() => {
    const board: Array<Square> = finalBoard.map((square) => ({
      color: "blank",
      name: square.name,
    }));
    for (const change of trimmedChanges) {
      board[change.index] = {
        name: finalBoard[change.index].name,
        color: change.color,
      };
    }
    return board;
  }, [finalBoard, trimmedChanges]);
  const teamColors = useMemo(
    () => getTeamColors(board, changes, leagueP1, leagueP2),
    [board, changes, leagueP1, leagueP2],
  );
  const finalResult = useMemo(
    () =>
      getResultForTeams(
        finalBoard,
        changes,
        teamColors,
        getTeamScores(finalBoard, teamColors),
      ),
    [changes, finalBoard, teamColors],
  );
  const result = useMemo(() => {
    if (finalResult == null || isFinal) {
      return finalResult;
    }
    const teamScores = getTeamScores(board, teamColors);
    const inProgressResult: MatchResult = {
      winnerName: finalResult.winnerName,
      winnerColor: finalResult.winnerColor,
      winnerScore: teamScores[finalResult.winnerName],
      winnerBingo: false,
      opponentName: finalResult.opponentName,
      opponentColor: finalResult.opponentColor,
      opponentScore:
        finalResult.opponentName != null
          ? (teamScores[finalResult.opponentName] ?? 0)
          : null,
    };
    return inProgressResult;
  }, [board, finalResult, isFinal, teamColors]);
  const winType = useMemo(() => {
    if (
      finalResult == null ||
      finalResult.opponentName == null ||
      finalResult.opponentScore == null ||
      !isFinal
    ) {
      return null;
    }
    return finalResult.winnerBingo
      ? "Bingo"
      : finalResult.winnerScore > finalResult.opponentScore
        ? "Majority"
        : "Tiebreak";
  }, [finalResult, isFinal]);
  const overlays = useMemo(
    () => getOverlays(noMistakes, startTime),
    [noMistakes, startTime],
  );
  return (
    <>
      <Board
        board={board}
        overlays={showOverlays && overlays != null ? overlays : undefined}
        onClickSquare={null}
        isHidden={!isRevealed || !isBoardVisible}
        setIsHidden={async (newIsHidden) => {
          if (!newIsHidden && isBoardVisible) {
            await db.revealedMatches.add({ id: matchId });
          }
        }}
        hiddenText={
          isBoardVisible ? (
            "Click to reveal match details"
          ) : (
            <>
              No goals have been claimed yet! The board can be
              <br />
              viewed after at least one goal has been claimed
              <br />
              and data has been refreshed.
            </>
          )
        }
        shownDifficulties={["general", "veryhard"]}
        viewerColor={null}
      />
      {isRevealed && result != null && (
        <Group justify="space-between">
          <BingosyncColored color={result.winnerColor as BingosyncColor}>
            <Text>
              <strong>
                {result.winnerName}: {result.winnerScore}
                {winType != null && ` (${winType} win)`}
              </strong>
            </Text>
          </BingosyncColored>
          {result.opponentName != null && (
            <BingosyncColored
              color={(result.opponentColor ?? "blank") as BingosyncColor}
            >
              <Text>
                <strong>
                  {result.opponentName}: {result.opponentScore ?? 0}
                </strong>
              </Text>
            </BingosyncColored>
          )}
        </Group>
      )}
    </>
  );
}
