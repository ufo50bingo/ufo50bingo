"use client";

import Board from "@/app/Board";
import {
  BingosyncColor,
  getChangelog,
  RawFeed,
  Square,
  TBoard,
} from "@/app/matches/parseBingosyncData";
import { Group, Stack } from "@mantine/core";
import { useCallback, useMemo, useState } from "react";
import Feed from "../common/Feed";
import { Game, GoalName, ORDERED_GAMES } from "@/app/goals";
import { getAllTerminalCodes, getGameToGoals } from "./findAllGames";
import { GOAL_TO_TYPES } from "./goalToTypes";
import GeneralGoal from "./GeneralGoal";
import InfoCard from "./InfoCard";
import GameInfo from "./GameInfo";
import CastSettings from "./CastSettings";
import GeneralIcons from "./GeneralIcons";
import EditSquare from "./EditSquare";
import { getResult } from "@/app/matches/computeResult";
import useSyncedState, { CountState, CurrentGame } from "./useSyncedState";
import useLocalState from "./useLocalState";
import useBingosyncSocket from "../common/useBingosyncSocket";
import useDings from "../play/useDings";
import { isGift, isGoldCherry } from "@/app/daily/giftGoldCherry";
import GameSelector from "./GameSelector";
import BingosyncColored from "@/app/matches/BingosyncColored";

export type CastProps = {
  id: string;
  board: TBoard;
  rawFeed: RawFeed;
  socketKey: string;
  initialSeed: number;
  initialCounts: { [goal: string]: CountState };
  initialLeftColor: BingosyncColor;
  initialRightColor: BingosyncColor;
  initialLeftGames: ReadonlyArray<CurrentGame>;
  initialRightGames: ReadonlyArray<CurrentGame>;
  playerName: string;
};

export default function Cast({
  id,
  board: initialBoard,
  rawFeed: initialRawFeed,
  socketKey,
  initialSeed,
  initialCounts,
  initialLeftColor,
  initialRightColor,
  initialLeftGames,
  initialRightGames,
  playerName,
}: CastProps) {
  const [gameToGoals, setGameToGoals] = useState(() =>
    getGameToGoals(initialBoard)
  );
  const [terminalCodes, setTerminalCodes] = useState(() =>
    getAllTerminalCodes(initialBoard)
  );
  const [editingIndex, setEditingIndex] = useState<null | number>(null);

  const onNewCard = useCallback((newBoard: TBoard) => {
    setGameToGoals(getGameToGoals(newBoard));
    setTerminalCodes(getAllTerminalCodes(newBoard));
  }, []);

  const [pauseRequestName, setPauseRequestName] = useState<string | null>(null);
  const [dings, setDings] = useDings("cast");

  const { board, rawFeed, seed, reconnectModal, dingAudio } =
    useBingosyncSocket({
      id,
      initialBoard,
      initialRawFeed,
      initialSeed,
      socketKey,
      onNewCard,
      playerName,
      setPauseRequestName,
      dings,
    });

  const {
    leftColor,
    setLeftColor,
    rightColor,
    setRightColor,
    generals,
    setGeneralGameCount,
    leftGames,
    rightGames,
    addLeftGame,
    addRightGame,
  } = useSyncedState({
    id,
    seed,
    initialCounts,
    initialLeftColor,
    initialRightColor,
    initialLeftGames,
    initialRightGames,
  });
  const {
    shownDifficulties,
    showAll,
    setShownDifficulties,
    addShowAll,
    sortType,
    setSortType,
    iconType,
    setIconType,
    hideByDefault,
    setHideByDefault,
  } = useLocalState(id, seed);

  const [isHiddenRaw, setIsHidden] = useState(hideByDefault);

  const leftScore = board.filter((square) => square.color === leftColor).length;
  const rightScore = board.filter(
    (square) => square.color === rightColor
  ).length;

  const isHidden = isHiddenRaw && leftScore === 0 && rightScore === 0;

  const tiebreakWinner = useMemo<BingosyncColor | null>(() => {
    try {
      if (
        leftScore !== rightScore ||
        leftColor === rightColor ||
        leftScore === 0
      ) {
        return null;
      }
      const changelog = getChangelog(rawFeed);
      const result = getResult(board, changelog, null, null);
      if (result == null) {
        return null;
      }
      const isValid =
        result.winnerScore === leftScore &&
        result.opponentScore === leftScore &&
        (result.winnerColor === leftColor ||
          result.winnerColor === rightColor) &&
        (result.opponentColor === leftColor ||
          result.opponentColor === rightColor);
      if (!isValid) {
        return null;
      }
      return result.winnerColor as BingosyncColor;
    } catch {
      return null;
    }
  }, [leftScore, rightScore, leftColor, rightColor, rawFeed, board]);

  const generalGoals = useMemo<ReadonlyArray<Square>>(() => {
    const filtered = board.filter((square) => {
      const types = GOAL_TO_TYPES[square.name];
      return types != null && types[1] === "general";
    });
    let spliceIndex = filtered.findIndex((square) =>
      isGift(square.name as GoalName)
    );
    if (spliceIndex < 0) {
      spliceIndex = filtered.findIndex((square) =>
        isGoldCherry(square.name as GoalName)
      );
    }
    if (spliceIndex < 0) {
      return filtered;
    }
    const [toMove] = filtered.splice(spliceIndex, 1);
    filtered.unshift(toMove);
    return filtered;
  }, [board]);

  const multiGoalGames = Object.keys(gameToGoals).filter(
    (game) => gameToGoals[game].length > 1
  );
  switch (sortType) {
    case "fast":
    case "alphabetical":
      multiGoalGames.sort((a, b) => a.localeCompare(b));
      break;
    case "chronological":
      multiGoalGames.sort(
        (a, b) =>
          ORDERED_GAMES.indexOf(a as Game) - ORDERED_GAMES.indexOf(b as Game)
      );
      break;
  }
  const multiGoalGameElements = multiGoalGames.map((game) => (
    <GameInfo
      key={game}
      game={game as Game}
      goals={gameToGoals[game]}
      description={null}
    />
  ));

  const getCard = (g: Square, h: null | undefined | number) => (
    <GeneralGoal
      key={g.name}
      gameToGoals={gameToGoals}
      name={g.name as GoalName}
      isFinished={g.color !== "blank"}
      terminalCodes={terminalCodes}
      countState={generals[g.name]}
      showAll={showAll.includes(g.name as GoalName)}
      setGeneralGameCount={setGeneralGameCount}
      addShowAll={addShowAll}
      leftColor={leftColor}
      rightColor={rightColor}
      height={h}
      sortType={sortType}
    />
  );

  const leftGame = leftGames.length > 0 ? leftGames[0].game : null;
  const rightGame = rightGames.length > 0 ? rightGames[0].game : null;

  const highlights = useMemo(() => {
    const leftIndices = (
      (leftGame == null ? null : gameToGoals[leftGame]) ?? []
    ).map((item) => item[1]);
    const rightIndices = (
      (rightGame == null ? null : gameToGoals[rightGame]) ?? []
    ).map((item) => item[1]);
    const highlights = Array(25)
      .fill(null)
      .map((_, index) => {
        const colors: Array<BingosyncColor> = [];
        if (leftIndices.includes(index)) {
          colors.push(leftColor);
        }
        if (rightIndices.includes(index)) {
          colors.push(rightColor);
        }
        return colors;
      });
    return highlights;
  }, [leftColor, rightColor, leftGame, rightGame, gameToGoals]);

  return (
    <>
      <Group>
        <Group gap={0}>
          <GeneralIcons
            isLeft={true}
            color={leftColor}
            score={leftScore}
            generalGoals={generalGoals}
            generalState={generals}
            hasTiebreaker={tiebreakWinner === leftColor}
            iconType={iconType}
            isHidden={isHidden}
          />
          <Board
            board={board}
            highlights={highlights}
            onClickSquare={setEditingIndex}
            isHidden={isHidden}
            setIsHidden={setIsHidden}
            shownDifficulties={shownDifficulties}
            hiddenText="Click or start Countdown to reveal"
            pauseRequestName={pauseRequestName}
            clearPauseRequest={() => setPauseRequestName(null)}
          />
          <GeneralIcons
            isLeft={false}
            color={rightColor}
            score={rightScore}
            generalGoals={generalGoals}
            generalState={generals}
            hasTiebreaker={tiebreakWinner === rightColor}
            iconType={iconType}
            isHidden={isHidden}
          />
        </Group>
        <Feed rawFeed={rawFeed} />
        <Stack gap={8}>
          <Group>
            <GameSelector
              color={leftColor}
              game={leftGame}
              onChange={addLeftGame}
            />
            <GameSelector
              color={rightColor}
              game={rightGame}
              onChange={addRightGame}
            />
          </Group>
          {generalGoals.length > 0 && getCard(generalGoals[0], 431)}
        </Stack>
        <Group w="100%">
          {generalGoals.slice(1).map((g) => getCard(g, null))}
          <InfoCard title="Multi-goal games" height={null} width={205}>
            <Stack gap={4}>
              {multiGoalGameElements.length > 0
                ? multiGoalGameElements
                : "No multi-goal games on this card!"}
            </Stack>
          </InfoCard>
        </Group>
      </Group>
      <CastSettings
        id={id}
        seed={seed}
        leftColor={leftColor}
        setLeftColor={setLeftColor}
        rightColor={rightColor}
        setRightColor={setRightColor}
        shownDifficulties={shownDifficulties}
        setShownDifficulties={setShownDifficulties}
        sortType={sortType}
        setSortType={setSortType}
        iconType={iconType}
        setIconType={setIconType}
        hideByDefault={hideByDefault}
        setHideByDefault={setHideByDefault}
        dings={dings}
        setDings={setDings}
        leftScore={leftScore}
        rightScore={rightScore}
        generalCounts={generals}
        generalGoals={generalGoals}
      />
      {editingIndex != null && (
        <EditSquare
          id={id}
          board={board}
          editingIndex={editingIndex}
          setEditingIndex={setEditingIndex}
        />
      )}
      {reconnectModal}
      {dingAudio}
    </>
  );
}
