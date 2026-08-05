"use client";

import Board from "@/app/Board";
import {
  BingosyncColor,
  getChangelog,
  RawFeed,
  TBoard,
} from "@/app/matches/parseBingosyncData";
import { Group, Stack, Text } from "@mantine/core";
import { useCallback, useMemo, useState } from "react";
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
import findGoal, { FoundGoal } from "@/app/findGoal";
import { STANDARD_UFO } from "@/app/pastas/standardUfo";
import { FoundStandardGeneral, GeneralItem } from "../cast/Cast";
import useLocalBool from "@/app/localStorage/useLocalBool";
import useFont from "@/app/font/useFont";
import useSyncedTimer, { FullSyncedTimerEvent } from "../common/useSyncedTimer";
import SyncedTimerBoardCover from "../common/SyncedTimerBoardCover";
import SyncedTimer from "../common/SyncedTimer";
import StartPauseButton from "../common/StartPauseButton";
import { UFOPasta } from "@/app/generator/ufoGenerator";
import { NES_50_UFO } from "@/app/pastas/nes50Ufo";
import { RoomBackend } from "@/app/roomApi";
import { GeneralRestrictions } from "./GeneralSection";
import useGeneralSettings from "./useGeneralSettings";
import useFullGeneralState from "./useFullGeneralState";
import GeneralGoal from "../cast/GeneralGoal";
import useShowAll from "../common/useShowAll";
import { getAllTerminalCodes, getGameToGoals } from "../cast/findAllGames";
import getGameList from "../common/getGameList";
import getIsNes50 from "../common/getIsNes50";
import { Game, ORDERED_GAMES } from "@/app/goals";
import GameInfo from "../cast/GameInfo";
import InfoCard from "../cast/InfoCard";
import { EVERY_GAME_UFO } from "@/app/pastas/everyGameUfo";

export type Props = {
  id: string;
  board: TBoard;
  rawFeed: RawFeed;
  socketKey: string;
  initialSeed: number;
  initialTimerEvents: ReadonlyArray<FullSyncedTimerEvent>;
  playerName: string;
  roomBackend: RoomBackend;
};

export default function Play({
  id,
  board: initialBoard,
  rawFeed: initialRawFeed,
  socketKey,
  initialSeed,
  playerName,
  initialTimerEvents,
  roomBackend,
}: Props) {
  const [shownDifficulties, setShownDifficulties] = useShownDifficulties();
  const [showGeneralTrackerRaw, setShowGeneralTracker] = useLocalBool({
    key: "show_general_tracker",
    defaultValue: true,
  });
  const [soundChoices, setSoundChoices, playAudio] = useSounds("play");
  const [color, setColor] = useColor(id, roomBackend);
  const [font, setFont] = useFont();

  const selectedColor = color ?? "red";

  // 525px is the width of the board, which is also the default width of the modal
  const isMobile = useMediaQuery("(max-width: 525px)");

  useWakeLock();

  const [gameToGoals, setGameToGoals] = useState(() =>
    getGameToGoals(initialBoard, getGameList(getIsNes50(initialBoard))),
  );
  const [terminalCodes, setTerminalCodes] = useState(() =>
    getAllTerminalCodes(initialBoard),
  );

  const onNewCard = useCallback((newBoard: TBoard) => {
    setGameToGoals(getGameToGoals(newBoard, getGameList(getIsNes50(newBoard))));
    setTerminalCodes(getAllTerminalCodes(newBoard));
  }, []);

  const { board, rawFeed, seed, reconnectModal } = useBingosyncSocket({
    id,
    initialBoard,
    initialRawFeed,
    initialSeed,
    socketKey,
    playerName,
    onNewCard,
    playAudio,
    roomBackend,
  });

  const { addEvent, timerState, forceReveal } = useSyncedTimer({
    id,
    seed,
    initialEvents: initialTimerEvents,
    playAudio,
    isCast: false,
    roomBackend,
  });

  const generalGoals = useMemo<ReadonlyArray<GeneralItem>>(
    () => {
      return board
        .map((square) => {
          let foundGoal: null | FoundGoal<string, string, string> = null;
          foundGoal = findGoal(square.name, STANDARD_UFO);
          let pasta: UFOPasta = STANDARD_UFO;
          if (foundGoal == null) {
            foundGoal = findGoal(square.name, NES_50_UFO);
            pasta = NES_50_UFO;
          }
          if (foundGoal == null) {
            foundGoal = findGoal(square.name, EVERY_GAME_UFO);
            pasta = EVERY_GAME_UFO;
          }
          if (foundGoal == null || foundGoal.cast == null) {
            return null;
          }
          return {
            color: square.color,
            foundGoal: foundGoal as FoundStandardGeneral,
            pasta,
          };
        })
        .filter((item) => item != null);
    },
    [board],
  );

  const showGeneralTracker = showGeneralTrackerRaw && generalGoals.length > 0;

  const generalRestrictions = useMemo(() => {
    const isUfo50 = generalGoals.every(item => item.pasta === STANDARD_UFO);
    // TODO: Need something when no generals are detected?
    if (isUfo50) {
      return {
        canUseFull: false,
        canFilterOnCard: false,
        canShowOnCardTooltips: false,
        canFastSort: false,
        canSegment: false,
        canUseTerminalCodes: false,
        canShowMultiGoalGames: false,
      };
    }
    const isNes50 = generalGoals.every(item => item.pasta === NES_50_UFO);
    if (isNes50) {
      return {
        canUseFull: true,
        canFilterOnCard: true,
        canShowOnCardTooltips: false,
        canFastSort: false,
        canSegment: true,
        canUseTerminalCodes: false,
        canShowMultiGoalGames: true,
      };
    }
    return {
      canUseFull: true,
      canFilterOnCard: true,
      canShowOnCardTooltips: true,
      canFastSort: true,
      canSegment: true,
      canUseTerminalCodes: true,
      canShowMultiGoalGames: true,
    };
  }, [generalGoals]);

  const [generalSettings, generalSetters] = useGeneralSettings(generalRestrictions);
  const [fullGeneralState, setGeneralGameCount] = useFullGeneralState(id, seed);
  const [showAll, addShowAll] = useShowAll(`player-showall-${id}-${seed}`);

  const multiGoalGames = useMemo(() => {
    const multiGoalGames = Object.keys(gameToGoals).filter(
      (game) => gameToGoals[game].length > 1,
    );
    const canChronoLogicalSort = multiGoalGames.every((game) =>
      ORDERED_GAMES.includes(game as Game),
    );
    if (canChronoLogicalSort && generalSettings.sort === "chronological") {
      multiGoalGames.sort(
        (a, b) =>
          ORDERED_GAMES.indexOf(a as Game) - ORDERED_GAMES.indexOf(b as Game),
      );
    } else {
      multiGoalGames.sort((a, b) => a.localeCompare(b));
    }
    return multiGoalGames;
  }, [gameToGoals, generalSettings.sort]);

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

  const isHidden = (timerState.type === "not_started" &&
    !timerState.isForceRevealed) ||
    (timerState.type === "countdown" &&
      !timerState.wasPaused &&
      !timerState.isForceRevealed);
  return (
    <>
      <Group align="stretch">
        <Stack gap={8}>
          <Board
            board={board}
            onClickSquare={async (squareIndex) => {
              const isClearing = board[squareIndex].color === selectedColor;
              try {
                await changeColor(id, squareIndex, selectedColor, isClearing, roomBackend);
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
            <StartPauseButton
              timerState={timerState}
              isCast={false}
              addEvent={addEvent}
              seed={seed}
              playerName={playerName}
            />
          </Group>
          {showGeneralTracker && generalSettings.type === "simple" && (
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
            roomBackend={roomBackend}
            generalSettings={generalSettings}
            generalSetters={generalSetters}
            generalRestrictions={generalRestrictions}
          />
        </Stack>
        <Feed
          rawFeed={rawFeed}
          style={{ height: showGeneralTracker && generalSettings.type === "simple" ? "748px" : "592px" }}
          roomBackend={roomBackend}
        />
        {!isHidden && showGeneralTracker && generalSettings.type === "full" && generalGoals.map(g => (
          <GeneralGoal
            key={g.foundGoal.resolvedGoal}
            gameToGoals={gameToGoals}
            foundGoal={g.foundGoal}
            isFinished={g.color !== "blank"}
            terminalCodes={terminalCodes}
            countState={fullGeneralState[g.foundGoal.resolvedGoal]}
            showAll={showAll.includes(g.foundGoal.resolvedGoal)}
            setGeneralGameCount={setGeneralGameCount}
            addShowAll={addShowAll}
            playerColors={[selectedColor]}
            style={{ minHeight: "300px", maxHeight: "592px", flex: "1 1 auto" }}
            settings={generalSettings}
            pasta={g.pasta}
            restrictions={generalRestrictions}
          />
        ))}
        {
          !isHidden && showGeneralTracker && generalSettings.type === "full" && generalRestrictions.canShowMultiGoalGames && (
            <InfoCard title="Multi-goal games" style={{ minHeight: "300px", maxHeight: "592px", flex: "1 1 auto" }}>
              <Stack gap={4}>
                {multiGoalGames.length > 0
                  ? multiGoalGames.map((game) => (
                    <GameInfo
                      key={game}
                      game={game as Game}
                      goals={gameToGoals[game]}
                      description={null}
                      canShowTooltip={generalRestrictions.canShowOnCardTooltips}
                    />
                  ))
                  : "No multi-goal games on this card!"}
              </Stack>
            </InfoCard>
          )
        }
      </Group>
      {reconnectModal}
    </>
  );
}
