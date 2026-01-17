"use client";

import Board from "@/app/Board";
import {
  BingosyncColor,
  getChangelog,
  RawFeed,
  TBoard,
} from "@/app/matches/parseBingosyncData";
import { Group, Stack } from "@mantine/core";
import { useCallback, useMemo, useState } from "react";
import Feed from "../common/Feed";
import { Game, ORDERED_GAMES, ProperGame } from "@/app/goals";
import { getAllTerminalCodes, getGameToGoals } from "./findAllGames";
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
import SideColumn from "./SideColumn";
import RecentGames from "./RecentGames";
import ScoreSquare from "../common/ScoreSquare";
import SideCell from "./SideCell";
import { STANDARD_UFO } from "@/app/pastas/standardUfo";
import findGoal, { FoundGoal } from "@/app/findGoal";
import { StandardGeneral } from "@/app/pastas/pastaTypes";
import getGamesForPlayer from "./getGamesForPlayer";
import useLocalNumber from "@/app/localStorage/useLocalNumber";

export type FoundStandardGeneral = FoundGoal<
  StandardGeneral,
  "general",
  string
>;
export type GeneralItem = {
  color: BingosyncColor;
  foundGoal: FoundStandardGeneral;
};

export type CastProps = {
  id: string;
  board: TBoard;
  rawFeed: RawFeed;
  socketKey: string;
  initialSeed: number;
  initialCounts: { [goal: string]: CountState };
  initialLeftColor: BingosyncColor;
  initialRightColor: BingosyncColor;
  initialAllPlayerGames: ReadonlyArray<ReadonlyArray<CurrentGame>>;
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
  initialAllPlayerGames,
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
    allPlayerGames,
    addGame,
  } = useSyncedState({
    id,
    seed,
    initialCounts,
    initialLeftColor,
    initialRightColor,
    initialAllPlayerGames,
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
    showGameSelector,
    setShowGameSelector,
    highlightCurrentGame,
    setHighlightCurrentGame,
    showRecentGames,
    setShowRecentGames,
  } = useLocalState(id, seed);

  const [numPlayers, setNumPlayers] = useLocalNumber({ key: 'num-players', defaultValue: 2 });
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

  const generalGoals = useMemo<ReadonlyArray<GeneralItem>>(() => {
    const filtered = board
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
      .filter((item) => item != null);
    let spliceIndex = filtered.findIndex((item) => isGift(item.foundGoal.goal));
    if (spliceIndex < 0) {
      spliceIndex = filtered.findIndex((item) =>
        isGoldCherry(item.foundGoal.goal)
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

  const getCard = (g: GeneralItem, h: null | undefined | number) => (
    <GeneralGoal
      key={g.foundGoal.resolvedGoal}
      gameToGoals={gameToGoals}
      foundGoal={g.foundGoal}
      isFinished={g.color !== "blank"}
      terminalCodes={terminalCodes}
      countState={generals[g.foundGoal.resolvedGoal]}
      showAll={showAll.includes(g.foundGoal.resolvedGoal)}
      setGeneralGameCount={setGeneralGameCount}
      addShowAll={addShowAll}
      leftColor={leftColor}
      rightColor={rightColor}
      height={h}
      sortType={sortType}
    />
  );

  const highlights = useMemo(() => {
    if (!highlightCurrentGame) {
      return undefined;
    }
    const currentGames = allPlayerGames.map(playerGames => playerGames[0]);
    const currentLeftGames = currentGames.filter((g, index) => g != null && index % 2 === 0);
    const currentRightGames = currentGames.filter((g, index) => g != null && index % 2 === 1);
    const leftIndices = currentLeftGames.
      flatMap(game => game.game != null ? (gameToGoals[game.game] ?? []) : [])
      .map(item => item[1]);
    const rightIndices = currentRightGames
      .flatMap(game => game.game != null ? (gameToGoals[game.game] ?? []) : [])
      .map(item => item[1]);
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
  }, [
    allPlayerGames,
    leftColor,
    rightColor,
    gameToGoals,
    highlightCurrentGame,
  ]);

  const leftGames = getGamesForPlayer(allPlayerGames, 0);
  const rightGames = getGamesForPlayer(allPlayerGames, 1);

  const numRows = Math.ceil(numPlayers / 2);
  const gameSelectorHeight = numRows * 44;

  return (
    <>
      <Group align="start">
        <Group gap={0}>
          {showRecentGames && generalGoals.length > 0 && (
            <SideColumn>
              <RecentGames limit={6} recentGames={leftGames} />
            </SideColumn>
          )}
          <SideColumn>
            <SideCell>
              <ScoreSquare
                color={leftColor}
                score={leftScore}
                hasTiebreaker={tiebreakWinner === leftColor}
              />
            </SideCell>
            <GeneralIcons
              isLeft={true}
              color={leftColor}
              generalGoals={generalGoals}
              generalState={generals}
              iconType={iconType}
              isHidden={isHidden}
            />
            {showRecentGames && generalGoals.length === 0 && (
              <RecentGames limit={5} recentGames={leftGames} />
            )}
          </SideColumn>
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
          <SideColumn>
            <SideCell>
              <ScoreSquare
                color={rightColor}
                score={rightScore}
                hasTiebreaker={tiebreakWinner === rightColor}
              />
            </SideCell>
            <GeneralIcons
              isLeft={false}
              color={rightColor}
              generalGoals={generalGoals}
              generalState={generals}
              iconType={iconType}
              isHidden={isHidden}
            />
            {showRecentGames && generalGoals.length === 0 && (
              <RecentGames limit={5} recentGames={rightGames} />
            )}
          </SideColumn>
          {showRecentGames && generalGoals.length > 0 && (
            <SideColumn>
              <RecentGames limit={6} recentGames={rightGames} />
            </SideColumn>
          )}
        </Group>
        <Feed rawFeed={rawFeed} />
        {showGameSelector ? (
          <Stack gap={8}>
            <Group wrap="wrap" w={268} gap={8} justify="space-between">
              {(new Array(numPlayers)).fill(null).map((_, playerNum) => (
                <GameSelector
                  key={playerNum}
                  color={playerNum % 2 === 0 ? leftColor : rightColor}
                  game={getGamesForPlayer(allPlayerGames, playerNum)[0]?.game ?? null}
                  onChange={(newGame: ProperGame | null) => addGame(newGame, playerNum)}
                />
              ))}
            </Group>
            {generalGoals.length > 0 ? (
              getCard(generalGoals[0], 475 - gameSelectorHeight)
            ) : (
              <InfoCard title="Multi-goal games" height={475 - gameSelectorHeight}>
                <Stack gap={4}>
                  {multiGoalGameElements.length > 0
                    ? multiGoalGameElements
                    : "No multi-goal games on this card!"}
                </Stack>
              </InfoCard>
            )}
          </Stack>
        ) : generalGoals.length > 0 ? (
          getCard(generalGoals[0], 475)
        ) : (
          <InfoCard title="Multi-goal games" height={475}>
            <Stack gap={4}>
              {multiGoalGameElements.length > 0
                ? multiGoalGameElements
                : "No multi-goal games on this card!"}
            </Stack>
          </InfoCard>
        )}
        {generalGoals.length > 0 && (
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
        )}
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
        showGameSelector={showGameSelector}
        setShowGameSelector={setShowGameSelector}
        highlightCurrentGame={highlightCurrentGame}
        setHighlightCurrentGame={setHighlightCurrentGame}
        showRecentGames={showRecentGames}
        setShowRecentGames={setShowRecentGames}
        numPlayers={numPlayers}
        setNumPlayers={setNumPlayers}
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
