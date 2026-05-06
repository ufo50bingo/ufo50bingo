"use client";

import Board from "@/app/Board";
import {
  BingosyncColor,
  getChangelog,
  RawFeed,
  TBoard,
} from "@/app/matches/parseBingosyncData";
import { Group, Stack, Text } from "@mantine/core";
import { useMemo } from "react";
import PlaySettings from "./PlaySettings";
import useColor from "./useColor";
import useShownDifficulties from "./useShownDifficulties";
import useSounds from "./useSounds";
import useWakeLock from "./useWakeLock";
import changeColor from "../cast/changeColor";
import Feed from "../common/Feed";
import useBingosyncSocket from "../common/useBingosyncSocket";
import { getResult } from "@/app/matches/computeResult";
import ScoreSquare from "../common/ScoreSquare";
import { useMediaQuery } from "@mantine/hooks";
import SimpleGeneralTracker from "./SimpleGeneralTracker";
import findGoal from "@/app/findGoal";
import { STANDARD_UFO } from "@/app/pastas/standardUfo";
import { FoundStandardGeneral, GeneralItem } from "../cast/Cast";
import useLocalBool from "@/app/localStorage/useLocalBool";
import useFont from "@/app/font/useFont";
import useSyncedTimer, { FullSyncedTimerEvent } from "../common/useSyncedTimer";
import SyncedTimerBoardCover from "../common/SyncedTimerBoardCover";
import SyncedTimer from "../common/SyncedTimer";
import StartPauseButton from "../common/StartPauseButton";

export type Props = {
  id: string;
  board: TBoard;
  rawFeed: RawFeed;
  socketKey: string;
  initialSeed: number;
  initialTimerEvents: ReadonlyArray<FullSyncedTimerEvent>;
  playerName: string;
};

export default function Play({
  id,
  board: initialBoard,
  rawFeed: initialRawFeed,
  socketKey,
  initialSeed,
  playerName,
  initialTimerEvents,
}: Props) {
  const [shownDifficulties, setShownDifficulties] = useShownDifficulties();
  const [showGeneralTracker, setShowGeneralTracker] = useLocalBool({
    key: "show_general_tracker",
    defaultValue: true,
  });
  const [soundChoices, setSoundChoices, playAudio] = useSounds("play");
  const [color, setColor] = useColor(id);
  const [font, setFont] = useFont();

  const selectedColor = color ?? "red";

  // 525px is the width of the board, which is also the default width of the modal
  const isMobile = useMediaQuery("(max-width: 525px)");

  useWakeLock();

  const { board, rawFeed, seed, reconnectModal } = useBingosyncSocket({
    id,
    initialBoard,
    initialRawFeed,
    initialSeed,
    socketKey,
    playerName,
    onNewCard: empty,
    playAudio,
  });

  const { addEvent, timerState, forceReveal } = useSyncedTimer({
    id,
    seed,
    initialEvents: initialTimerEvents,
    playAudio,
    isCast: false,
  });

  const generalGoals = useMemo<ReadonlyArray<GeneralItem>>(
    () =>
      board
        .map((square) => {
          const foundGoal = findGoal(square.name, STANDARD_UFO);
          if (foundGoal == null || foundGoal.category !== "general") {
            return null;
          }
          return {
            color: square.color,
            foundGoal: foundGoal as FoundStandardGeneral,
          };
        })
        .filter((item) => item != null),
    [board],
  );

  const [myScore, opponent] = useMemo(() => {
    const scores: { [color: string]: number } = {};
    board.forEach((square) => {
      const color = square.color;
      if (color === "blank") {
        return;
      }
      const score = scores[color] ?? 0;
      scores[color] = score + 1;
    });
    const myScore = scores[selectedColor] ?? 0;
    const entries = Object.entries(scores);
    entries.sort((a, b) => a[1] - b[1]);
    const bestOpponent = entries.find((e) => e[0] !== selectedColor);
    const bestOpponentEntry =
      bestOpponent == null
        ? null
        : { color: bestOpponent[0] as BingosyncColor, score: bestOpponent[1] };
    return [myScore, bestOpponentEntry];
  }, [board, selectedColor]);

  const tiebreakWinner = useMemo<BingosyncColor | null>(() => {
    try {
      if (
        opponent == null ||
        myScore !== opponent.score ||
        selectedColor === opponent.color
      ) {
        return null;
      }
      const changelog = getChangelog(rawFeed);
      const result = getResult(board, changelog.changes, null, null);
      if (result == null) {
        return null;
      }
      const isValid =
        result.winnerScore === myScore &&
        result.opponentScore === myScore &&
        (result.winnerColor === selectedColor ||
          result.winnerColor === opponent.color) &&
        (result.opponentColor === selectedColor ||
          result.opponentColor === opponent.color);
      if (!isValid) {
        return null;
      }
      return result.winnerColor as BingosyncColor;
    } catch {
      return null;
    }
  }, [opponent, myScore, selectedColor, rawFeed, board]);
  return (
    <>
      <Group align="start">
        <Stack gap={8}>
          <Board
            board={board}
            onClickSquare={async (squareIndex) => {
              const isClearing = board[squareIndex].color === selectedColor;
              try {
                await changeColor(id, squareIndex, selectedColor, isClearing);
              } catch { }
            }}
            shownDifficulties={shownDifficulties}
            viewerColor={selectedColor}
            boardCover={
              <SyncedTimerBoardCover
                isCast={false}
                timerState={timerState}
                isBoardVisibleByDefault={false}
                forceReveal={forceReveal}
              />
            }
          />
          <Group justify="space-between">
            <div style={{ display: "flex" }}>
              <div
                style={{ width: "62px", height: "62px", marginRight: "8px" }}
              >
                <ScoreSquare
                  score={myScore}
                  color={selectedColor}
                  hasTiebreaker={tiebreakWinner === selectedColor}
                  isDouble={false}
                  font={font}
                />
              </div>
              <div style={{ width: "62px", height: "62px" }}>
                <ScoreSquare
                  score={opponent?.score ?? 0}
                  color={opponent?.color ?? "blank"}
                  hasTiebreaker={tiebreakWinner === opponent?.color}
                  isDouble={false}
                  font={font}
                />
              </div>
            </div>
            <div
              style={{
                textAlign: "right",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              <Text size="44px">
                <SyncedTimer timerState={timerState} />
              </Text>
            </div>
            <StartPauseButton timerState={timerState} isCast={false} addEvent={addEvent} seed={seed} playerName={playerName} />
          </Group>
          {showGeneralTracker && (
            <SimpleGeneralTracker
              isHidden={
                (timerState.type === "not_started" &&
                  !timerState.isForceRevealed) ||
                (timerState.type === "countdown" &&
                  !timerState.wasPaused &&
                  !timerState.isForceRevealed)
              }
              id={id}
              seed={seed}
              generalGoals={generalGoals}
            />
          )}
          <PlaySettings
            id={id}
            color={color}
            setColor={setColor}
            shownDifficulties={shownDifficulties}
            setShownDifficulties={setShownDifficulties}
            soundChoices={soundChoices}
            setSoundChoices={setSoundChoices}
            isMobile={isMobile}
            showGeneralTracker={showGeneralTracker}
            setShowGeneralTracker={setShowGeneralTracker}
            font={font}
            setFont={setFont}
            addEvent={addEvent}
            seed={seed}
            timerState={timerState}
            forceReveal={forceReveal}
          />
        </Stack>
        <Feed
          rawFeed={rawFeed}
          height={showGeneralTracker ? "748px" : "592px"}
        />
      </Group>
      {reconnectModal}
    </>
  );
}

function empty(): void {
  return;
}
