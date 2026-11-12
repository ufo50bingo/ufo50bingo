"use client";

import Board from "@/app/Board";
import { BingosyncColor } from "@/app/matches/parseBingosyncData";
import { Group, Stack, Text, Tooltip } from "@mantine/core";
import { useMemo, useState } from "react";
import Feed from "../common/Feed";
import { Game, ORDERED_GAMES, ProperGame } from "@/app/goals";
import { getAllTerminalCodes, getGameToGoals } from "./findAllGames";
import GeneralGoal from "./GeneralGoal";
import InfoCard from "./InfoCard";
import GameInfo from "./GameInfo";
import CastSettings from "./CastSettings";
import GeneralIcons from "./GeneralIcons";
import EditSquare from "./EditSquare";
import { AllPlayerGames, CountChange, CurrentGame } from "./useSyncedState";
import useLocalState from "./useLocalState";
import useBingosyncSocket from "../common/useBingosyncSocket";
import useSounds from "../play/useSounds";
import GameSelector from "./GameSelector";
import SideColumn from "./SideColumn";
import RecentGames from "./RecentGames";
import ScoreSquare from "../common/ScoreSquare";
import SideCell from "./SideCell";
import { STANDARD_UFO } from "@/app/pastas/standardUfo";
import findGoal, { FoundGoalWithCast } from "@/app/findGoal";
import useLocalEnum from "@/app/localStorage/useLocalEnum";
import { GENERAL_ORDER } from "./GeneralOrderSelector";
import useFont from "@/app/font/useFont";
import useSyncedTimer from "../common/useSyncedTimer";
import SyncedTimerBoardCover from "../common/SyncedTimerBoardCover";
import SyncedTimer from "../common/SyncedTimer";
import StartPauseButton from "../common/StartPauseButton";
import { NES_50_UFO } from "@/app/pastas/nes50Ufo";
import { UFOPasta } from "@/app/generator/ufoGenerator";
import getGameList from "../common/getGameList";
import { Restrictions, GeneralSettings } from "../play/GeneralSection";
import { EVERY_GAME_UFO } from "@/app/pastas/everyGameUfo";
import useCastRightClickBehavior from "./useCastRightClickBehavior";
import { RightClickBehaviorContext } from "@/app/settings/RightClickBehaviorContext";
import {
  FeedCurrentSubcategory,
  FeedGoalProgress,
  NewFeed,
  ParsedGame,
  ParsedSubcategory,
  SquareWithId,
} from "@/app/fetchFeed";
import { GeneralCounts } from "./CastPage";
import useSquareColors from "../common/useSquareColors";
import useMembers, { PlayerMember } from "../common/useMembers";
import { useServerOffsetContext } from "../ServerOffsetContext";
import { getMatchingRepoPasta } from "@/app/getMatchingRepoPasta";
import StandardBoardWrapper from "@/app/StandardBoardWrapper";

const RESTRICTIONS: Restrictions = {
  canTagDifficultyFor: null,
  canUseFull: true,
  canFilterOnCard: true,
  canShowOnCardTooltips: true,
  canFastSort: true,
  canSegment: true,
  canUseTerminalCodes: true,
  canShowMultiGoalGames: true,
};

export type FoundStandardGeneral = FoundGoalWithCast<string, string, string>;
export type GeneralItem = {
  foundGoal: FoundStandardGeneral;
  pasta: UFOPasta;
  squareIndex: number;
};

export type CastProps = {
  game: ParsedGame;
  initialFeed: NewFeed;
  userId: number;
  squares: ReadonlyArray<SquareWithId>;
  subcategories: ReadonlyArray<ParsedSubcategory>;
  token: string;
  fetchedPasta: null | UFOPasta;
};

const COUNT_POSITION = ["side_by_side", "inset"] as const;
export type TCountPosition = (typeof COUNT_POSITION)[number];

export default function Cast({
  game,
  initialFeed,
  userId,
  squares,
  subcategories,
  token,
  fetchedPasta,
}: CastProps) {
  const gameId = game.id;
  const pastaId = game.pastaId;
  const isLockout = game.isLockout;
  const boardSize = game.width * game.height;
  const { getServerMsFromClientMs } = useServerOffsetContext();
  const squareNames = useMemo(() => squares.map((s) => s.name), [squares]);
  const [soundChoices, setSoundChoices, playAudio] = useSounds("cast");
  const { feed, reconnectModal, sendEvents } = useBingosyncSocket({
    gameId,
    initialFeed,
    userId,
    playAudio,
    token,
  });
  const { allMembers, players, casters } = useMembers(feed);
  const squareColors = useSquareColors(feed, boardSize, isLockout);
  const [rightClickBehavior, setRightClickBehavior] =
    useCastRightClickBehavior();
  const rightClickBehaviorContextValue = useMemo(
    () => ({
      rightClickBehavior,
      setRightClickBehavior,
      customColor: "#ee5f5b",
      setCustomColor: () => {},
    }),
    [rightClickBehavior, setRightClickBehavior],
  );

  const pasta = useMemo(() => {
    if (pastaId == null) {
      return null;
    }
    if (fetchedPasta != null) {
      return fetchedPasta;
    }
    return getMatchingRepoPasta(pastaId);
  }, [fetchedPasta, pastaId]);

  const gameList = useMemo(() => getGameList(pasta), [pasta]);
  const sortedGameList = useMemo(
    () => Object.keys(gameList).toSorted((a, b) => b.length - a.length),
    [gameList],
  );
  const gameToGoals = useMemo(
    () => getGameToGoals(squareNames, sortedGameList, pasta),
    [squareNames, sortedGameList, pasta],
  );
  const terminalCodes = useMemo(
    () => getAllTerminalCodes(squareNames),
    [squareNames],
  );
  const [editingIndex, setEditingIndex] = useState<null | number>(null);
  const [isDetecting, setIsDetecting] = useState(false);

  const generals: GeneralCounts = useMemo(() => {
    const generalCounts: GeneralCounts = {};
    for (const item of feed) {
      if (item.type === "goal_progress") {
        const goalName = squares.find((sq) => sq.goalId === item.goalId)!.name;
        const subcategoryName = subcategories.find(
          (sc) => sc.subcategoryId === item.subcategoryId,
        )!.name;
        const goalCounts = generalCounts[goalName] ?? {};
        const playerCounts = goalCounts[item.userId] ?? {};
        playerCounts[subcategoryName] = item.count;
        goalCounts[item.userId] = playerCounts;
        generalCounts[goalName] = goalCounts;
      }
    }
    return generalCounts;
  }, [feed, squares, subcategories]);

  const allPlayerGames: AllPlayerGames = useMemo(() => {
    const allGames: Map<number, Array<CurrentGame>> = new Map();
    for (const item of feed) {
      if (item.type === "current_subcategory") {
        const userGames = allGames.get(item.userId) ?? [];
        if (item.subcategoryId == null) {
          userGames.push({ game: null, start_time: item.time });
        } else {
          const subcategory = subcategories.find(
            (sc) => sc.subcategoryId === item.subcategoryId,
          );
          userGames.push({
            game: subcategory?.name ?? null,
            start_time: item.time,
          });
        }
        allGames.set(item.userId, userGames);
      }
    }
    return allGames;
  }, [feed, subcategories]);

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
  } = useLocalState(gameId);

  const { timerState, forceReveal } = useSyncedTimer({
    gameId,
    feed,
    playAudio,
    isCast: false,
    members: allMembers,
  });

  const [generalOrder, setGeneralOrder] = useLocalEnum({
    key: "general-order",
    options: GENERAL_ORDER,
    defaultValue: "reading",
  });

  const [font, setFont] = useFont();

  const [countPosition, setCountPosition] = useLocalEnum({
    key: "count-position",
    defaultValue: "side_by_side",
    options: COUNT_POSITION,
  });

  const leftPlayer: null | undefined | PlayerMember = players[0];
  const rightPlayer: null | undefined | PlayerMember = players[1];

  const leftColor = leftPlayer?.color ?? "red";
  const rightColor = rightPlayer?.color ?? "red";

  const leftScore = squareColors.filter((colors) =>
    colors.includes(leftColor),
  ).length;
  const rightScore = squareColors.filter((colors) =>
    colors.includes(rightColor),
  ).length;

  const tiebreakWinner = null;
  // const tiebreakWinner = useMemo<BingosyncColor | null>(() => {
  //   try {
  //     if (
  //       leftScore !== rightScore ||
  //       leftColor === rightColor ||
  //       leftScore === 0
  //     ) {
  //       return null;
  //     }
  //     const changelog = getChangelog(rawFeed);
  //     const result = getResult(board, changelog.changes, null, null);
  //     if (result == null) {
  //       return null;
  //     }
  //     const isValid =
  //       result.winnerScore === leftScore &&
  //       result.opponentScore === leftScore &&
  //       (result.winnerColor === leftColor ||
  //         result.winnerColor === rightColor) &&
  //       (result.opponentColor === leftColor ||
  //         result.opponentColor === rightColor);
  //     if (!isValid) {
  //       return null;
  //     }
  //     return result.winnerColor as BingosyncColor;
  //   } catch {
  //     return null;
  //   }
  // }, [leftScore, rightScore, leftColor, rightColor, rawFeed, board]);

  const generalGoals = useMemo<ReadonlyArray<GeneralItem>>(() => {
    return squareNames
      .map((name, squareIndex) => {
        const pastasToCheck =
          pasta != null ? [pasta] : [STANDARD_UFO, NES_50_UFO, EVERY_GAME_UFO];
        for (const pastaToCheck of pastasToCheck) {
          const foundGoal = findGoal(name, pastaToCheck);
          if (foundGoal != null) {
            if (foundGoal.cast == null) {
              return null;
            }
            return {
              foundGoal: foundGoal as FoundStandardGeneral,
              pasta: pastaToCheck,
              squareIndex,
            };
          }
        }
        return null;
      })
      .filter((item) => item != null);
  }, [pasta, squareNames]);

  // TODO: Fix this
  const sortedGenerals = useMemo<ReadonlyArray<GeneralItem>>(() => {
    const correctOrder = Object.keys(pasta ?? STANDARD_UFO.goals.general);
    return generalGoals.toSorted((a, b) => {
      const aIdx = correctOrder.indexOf(a.foundGoal.subcategory);
      const bIdx = correctOrder.indexOf(b.foundGoal.subcategory);
      return aIdx - bIdx;
    });
  }, [generalGoals, pasta]);

  const generalSettings: GeneralSettings = useMemo(
    () => ({
      sort: sortType,
      shouldSegment: true,
      type: "full",
    }),
    [sortType],
  );

  const multiGoalGames = Object.keys(gameToGoals).filter(
    (game) => gameToGoals[game].length > 1,
  );
  const canChronoLogicalSort = multiGoalGames.every((game) =>
    ORDERED_GAMES.includes(game as ProperGame),
  );
  if (canChronoLogicalSort && sortType === "chronological") {
    multiGoalGames.sort(
      (a, b) =>
        ORDERED_GAMES.indexOf(a as Game) - ORDERED_GAMES.indexOf(b as Game),
    );
  } else {
    multiGoalGames.sort((a, b) => a.localeCompare(b));
  }
  const multiGoalGameElements = multiGoalGames.map((game) => (
    <GameInfo
      key={game}
      game={game as Game}
      goals={gameToGoals[game]}
      description={null}
      canShowTooltip={true}
    />
  ));

  const setGeneralGameCount = async (change: CountChange) => {
    const foundSquare = squares.find((square) => square.name === change.goal);
    const foundSubcategory = subcategories.find(
      (sc) => sc.name === change.game,
    );
    const event: FeedGoalProgress = {
      type: "goal_progress",
      userId: change.userId,
      time: getServerMsFromClientMs(Date.now()) / 1000,
      goalId: foundSquare!.goalId,
      subcategoryId: foundSubcategory!.subcategoryId,
      count: change.count,
    };
    await sendEvents([event]);
  };

  const getCard = (g: GeneralItem, h: null | undefined | number) => (
    <GeneralGoal
      key={g.foundGoal.resolvedGoal}
      isPlay={false}
      gameToGoals={gameToGoals}
      foundGoal={g.foundGoal}
      setGeneralGameCount={setGeneralGameCount}
      // TODO: Determine whether all colors have marked this
      isFinished={isLockout && squareColors[g.squareIndex].length > 0}
      terminalCodes={terminalCodes}
      countState={generals[g.foundGoal.resolvedGoal]}
      showAll={showAll.includes(g.foundGoal.resolvedGoal)}
      addShowAll={addShowAll}
      generalTrackerPlayers={players.slice(0, 2)}
      style={{ height: `${h ?? 300}px` }}
      settings={generalSettings}
      pasta={g.pasta}
      restrictions={RESTRICTIONS}
    />
  );

  const highlights = useMemo(() => {
    if (!highlightCurrentGame) {
      return undefined;
    }
    const highlights: Array<Array<BingosyncColor>> = Array(boardSize)
      .fill(null)
      .map((_) => []);
    for (const [userId, currentGames] of allPlayerGames.entries()) {
      const currentGame =
        currentGames.length > 0
          ? currentGames[currentGames.length - 1].game
          : null;
      if (currentGame != null) {
        const color = allMembers.get(userId)?.color ?? "red";
        for (const [_, index] of gameToGoals[currentGame] ?? []) {
          if (!highlights[index].includes(color)) {
            highlights[index].push(color);
          }
        }
      }
    }
    return highlights;
  }, [
    highlightCurrentGame,
    boardSize,
    allPlayerGames,
    allMembers,
    gameToGoals,
  ]);

  const leftGames =
    leftPlayer != null ? (allPlayerGames.get(leftPlayer.userId) ?? []) : [];
  const rightGames =
    rightPlayer != null ? (allPlayerGames.get(rightPlayer.userId) ?? []) : [];

  const numRows = Math.ceil(players.length / 2);
  const gameSelectorHeight = numRows * 44;

  const isDouble = generalGoals.length > 0 && countPosition === "side_by_side";

  const areGeneralIconsHidden =
    hideByDefault &&
    ((timerState.type === "not_started" && !timerState.isForceRevealed) ||
      (timerState.type === "countdown" &&
        !timerState.wasPaused &&
        !timerState.isForceRevealed));

  const addSubcategoryName = async (userId: number, newGame: string | null) => {
    const subcategoryId =
      subcategories.find((sc) => sc.name === newGame)?.subcategoryId ?? null;
    const event: FeedCurrentSubcategory = {
      type: "current_subcategory",
      userId,
      // eslint-disable-next-line react-hooks/purity
      time: getServerMsFromClientMs(Date.now()) / 1000,
      subcategoryId,
    };
    sendEvents([event]);
  };
  return (
    <RightClickBehaviorContext.Provider value={rightClickBehaviorContextValue}>
      <Group align="start">
        <Group gap={0}>
          {showRecentGames && generalGoals.length > 0 && (
            <SideColumn isDouble={false}>
              <RecentGames
                limit={6}
                recentGames={leftGames}
                font={font}
                gameList={gameList}
              />
            </SideColumn>
          )}
          <SideColumn isDouble={isDouble}>
            <SideCell>
              <ScoreSquare
                color={leftColor}
                score={leftScore}
                hasTiebreaker={tiebreakWinner === leftColor}
                isDouble={isDouble}
                font={font}
              />
            </SideCell>
            <GeneralIcons
              playerId={leftPlayer?.userId}
              isLeft={true}
              color={leftColor}
              generalGoals={
                generalOrder === "reading" ? generalGoals : sortedGenerals
              }
              generalState={generals}
              iconType={iconType}
              isHidden={areGeneralIconsHidden}
              countPosition={countPosition}
              font={font}
              squareColors={squareColors}
            />
            {showRecentGames && generalGoals.length === 0 && (
              <RecentGames
                limit={5}
                recentGames={leftGames}
                font={font}
                gameList={gameList}
              />
            )}
          </SideColumn>
          <StandardBoardWrapper rows={game.height} columns={game.width}>
            <Board
              pasta={pasta}
              board={squareColors.map((colors, index) => ({
                name: squareNames[index],
                color: colors.length > 0 ? colors[0] : "blank",
              }))}
              highlights={highlights}
              onClickSquare={setEditingIndex}
              boardCover={
                <SyncedTimerBoardCover
                  isCast={true}
                  timerState={timerState}
                  isBoardVisibleByDefault={!hideByDefault}
                  forceReveal={forceReveal}
                />
              }
              shownDifficulties={shownDifficulties}
              viewerColor={null}
              castInfo={{ leftColor, rightColor }}
              rows={game.height}
              columns={game.width}
            />
          </StandardBoardWrapper>
          <SideColumn isDouble={isDouble}>
            <SideCell>
              <ScoreSquare
                color={rightColor}
                score={rightScore}
                hasTiebreaker={tiebreakWinner === rightColor}
                isDouble={isDouble}
                font={font}
              />
            </SideCell>
            <GeneralIcons
              isLeft={false}
              playerId={rightPlayer?.userId}
              color={rightColor}
              generalGoals={
                generalOrder === "reading" ? generalGoals : sortedGenerals
              }
              generalState={generals}
              iconType={iconType}
              isHidden={areGeneralIconsHidden}
              countPosition={countPosition}
              font={font}
              squareColors={squareColors}
            />
            {showRecentGames && generalGoals.length === 0 && (
              <RecentGames
                limit={5}
                recentGames={rightGames}
                font={font}
                gameList={gameList}
              />
            )}
          </SideColumn>
          {showRecentGames && generalGoals.length > 0 && (
            <SideColumn isDouble={false}>
              <RecentGames
                limit={6}
                recentGames={rightGames}
                font={font}
                gameList={gameList}
              />
            </SideColumn>
          )}
        </Group>
        <Stack gap={8}>
          <Group justify="space-between">
            <Text
              style={{
                alignSelf: "center",
                fontVariantNumeric: "tabular-nums",
                fontSize: "23px",
              }}
            >
              <SyncedTimer timerState={timerState} />
            </Text>
            <StartPauseButton
              timerState={timerState}
              isCast={true}
              userId={userId}
              onCountdownStart={() => setIsDetecting(true)}
              sendEvents={sendEvents}
            />
          </Group>
          <Feed
            feed={feed}
            userId={userId}
            members={allMembers}
            players={players}
            squareNames={squareNames}
            isPlay={false}
            style={{ height: `${475 - 44}px` }}
            sendEvents={sendEvents}
          />
        </Stack>
        {showGameSelector ? (
          <Stack gap={8}>
            <Group wrap="wrap" w={268} gap={8} justify="space-between">
              {players.map((player) => {
                const playerGames = allPlayerGames.get(player.userId);
                return (
                  <Tooltip key={player.userId} label={player.name}>
                    <div>
                      <GameSelector
                        color={player.color}
                        game={
                          playerGames?.[playerGames.length - 1]?.game ?? null
                        }
                        onChange={async (newGame: ProperGame | null) =>
                          await addSubcategoryName(player.userId, newGame)
                        }
                        terminalCodes={terminalCodes}
                        gameList={gameList}
                      />
                    </div>
                  </Tooltip>
                );
              })}
            </Group>
            {generalGoals.length > 0 ? (
              getCard(sortedGenerals[0], 475 - gameSelectorHeight)
            ) : (
              <InfoCard
                title="Multi-goal games"
                style={{ height: `${475 - gameSelectorHeight}px` }}
              >
                <Stack gap={4}>
                  {multiGoalGameElements.length > 0
                    ? multiGoalGameElements
                    : "No multi-goal games on this card!"}
                </Stack>
              </InfoCard>
            )}
          </Stack>
        ) : generalGoals.length > 0 ? (
          getCard(sortedGenerals[0], 475)
        ) : (
          <InfoCard title="Multi-goal games" style={{ height: `475px` }}>
            <Stack gap={4}>
              {multiGoalGameElements.length > 0
                ? multiGoalGameElements
                : "No multi-goal games on this card!"}
            </Stack>
          </InfoCard>
        )}
        {generalGoals.length > 0 && (
          <Group w="100%">
            {sortedGenerals.slice(1).map((g) => getCard(g, null))}
            <InfoCard
              title="Multi-goal games"
              style={{ height: `300px` }}
              width={205}
            >
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
        userId={userId}
        shownDifficulties={shownDifficulties}
        setShownDifficulties={setShownDifficulties}
        sortType={sortType}
        setSortType={setSortType}
        iconType={iconType}
        setIconType={setIconType}
        hideByDefault={hideByDefault}
        setHideByDefault={setHideByDefault}
        soundChoices={soundChoices}
        setSoundChoices={setSoundChoices}
        generalCounts={generals}
        generalGoals={
          generalOrder === "reading" ? generalGoals : sortedGenerals
        }
        showGameSelector={showGameSelector}
        setShowGameSelector={setShowGameSelector}
        highlightCurrentGame={highlightCurrentGame}
        setHighlightCurrentGame={setHighlightCurrentGame}
        showRecentGames={showRecentGames}
        setShowRecentGames={setShowRecentGames}
        allPlayerGames={allPlayerGames}
        addSubcategoryName={addSubcategoryName}
        isDetecting={isDetecting}
        setIsDetecting={setIsDetecting}
        gameToGoals={gameToGoals}
        setGeneralGameCount={setGeneralGameCount}
        countPosition={countPosition}
        setCountPosition={setCountPosition}
        generalOrder={generalOrder}
        setGeneralOrder={setGeneralOrder}
        font={font}
        setFont={setFont}
        timerState={timerState}
        players={players}
        casters={casters}
        sendEvents={sendEvents}
        members={allMembers}
      />
      {editingIndex != null && (
        <EditSquare
          userId={userId}
          sendEvents={sendEvents}
          squareColors={squareColors}
          squareNames={squareNames}
          editingIndex={editingIndex}
          setEditingIndex={setEditingIndex}
        />
      )}
      {reconnectModal}
    </RightClickBehaviorContext.Provider>
  );
}
