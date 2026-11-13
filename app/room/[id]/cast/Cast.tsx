"use client";

import { Group, Stack, Text, Tooltip } from "@mantine/core";
import { useMemo, useState } from "react";
import Feed from "../common/Feed";
import { Game, ORDERED_GAMES, ProperGame } from "@/app/goals";
import { getAllTerminalCodes, getGameToGoals } from "./findAllGames";
import GeneralGoal from "./GeneralGoal";
import InfoCard from "./InfoCard";
import GameInfo from "./GameInfo";
import CastSettings from "./CastSettings";
import EditSquare from "./EditSquare";
import { CountChange } from "./useSyncedState";
import useLocalState from "./useLocalState";
import useBingosyncSocket from "../common/useBingosyncSocket";
import useSounds from "../play/useSounds";
import GameSelector from "./GameSelector";
import { FoundGoalWithCast } from "@/app/findGoal";
import useLocalEnum from "@/app/localStorage/useLocalEnum";
import useFont from "@/app/font/useFont";
import useSyncedTimer from "../common/useSyncedTimer";
import SyncedTimerBoardCover from "../common/SyncedTimerBoardCover";
import SyncedTimer from "../common/SyncedTimer";
import StartPauseButton from "../common/StartPauseButton";
import {
  PlayerTrackerRestrictions,
  UFOPasta,
} from "@/app/generator/ufoGenerator";
import getGameList from "../common/getGameList";
import { GeneralSettings } from "../play/GeneralSection";
import useCastRightClickBehavior from "./useCastRightClickBehavior";
import { RightClickBehaviorContext } from "@/app/settings/RightClickBehaviorContext";
import {
  FeedCurrentSubcategory,
  FeedGoalProgress,
  FullParsedGame,
} from "@/app/fetchFeed";
import useSquareColors from "../common/useSquareColors";
import useMembers from "../common/useMembers";
import { useServerOffsetContext } from "../ServerOffsetContext";
import CastBoardWithTrackers from "./CastBoardWithTrackers";
import usePasta from "../common/usePasta";
import useGeneralGoals from "../common/useGeneralGoals";
import useGeneralCounts from "./useGeneralCounts";
import PlayedGameState from "./PlayedGameState";

export const CASTER_RESTRICTIONS: PlayerTrackerRestrictions = {
  allowed_difficulty_tags: null,
  allow_fast_sort: true,
  show_on_card_tooltips: true,
  show_multi_goal_games: true,
};

export type FoundStandardGeneral = FoundGoalWithCast<string, string, string>;
export type GeneralItem = {
  foundGoal: FoundStandardGeneral;
  pasta: UFOPasta;
  squareIndex: number;
};

export type CastProps = {
  game: FullParsedGame;
  userId: null | number;
  token: null | string;
};

const COUNT_POSITION = ["side_by_side", "inset"] as const;
export type TCountPosition = (typeof COUNT_POSITION)[number];

export default function Cast({
  game: fullParsedGame,
  userId,
  token,
}: CastProps) {
  const { game, feed: initialFeed, squares, subcategories } = fullParsedGame;
  const gameId = game.id;
  const isLockout = game.isLockout;
  const boardSize = game.rows * game.cols;
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

  const pasta = usePasta(fullParsedGame);

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

  const generals = useGeneralCounts(feed, squares, subcategories);

  const subcategoryIdToName = useMemo(
    () => new Map(subcategories.map((sc) => [sc.subcategoryId, sc.name])),
    [subcategories],
  );
  const playedGameState = useMemo(() => PlayedGameState.fromFeed(feed), [feed]);
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

  const [font, setFont] = useFont();

  const [countPosition, setCountPosition] = useLocalEnum({
    key: "count-position",
    defaultValue: "side_by_side",
    options: COUNT_POSITION,
  });

  const generalGoals = useGeneralGoals(pasta, squareNames);
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

  const setGeneralGameCount =
    sendEvents == null
      ? null
      : async (change: CountChange) => {
          const foundSquare = squares.find(
            (square) => square.name === change.goal,
          );
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
      restrictions={CASTER_RESTRICTIONS}
    />
  );

  const numRows = Math.ceil(players.length / 2);
  const gameSelectorHeight = numRows * 44;

  const addSubcategoryName =
    sendEvents == null
      ? null
      : async (userId: number, newGame: string | null) => {
          const subcategoryId =
            subcategories.find((sc) => sc.name === newGame)?.subcategoryId ??
            null;
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
        <CastBoardWithTrackers
          game={fullParsedGame}
          pasta={pasta}
          countPosition={countPosition}
          showRecentGames={showRecentGames}
          generalGoals={generalGoals}
          font={font}
          iconType={iconType}
          players={players}
          areGeneralGoalsHidden={false}
          squareColors={squareColors}
          subcategoryIdToName={subcategoryIdToName}
          playedGameState={playedGameState}
          allMembers={allMembers}
          boardCover={
            <SyncedTimerBoardCover
              isCast={true}
              timerState={timerState}
              isBoardVisibleByDefault={!hideByDefault}
              forceReveal={forceReveal}
            />
          }
          gameList={gameList}
          gameToGoals={gameToGoals}
          shownDifficulties={shownDifficulties}
          generals={generals}
          onClickSquare={setEditingIndex}
        />
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
            {sendEvents != null && userId != null && (
              <StartPauseButton
                timerState={timerState}
                isCast={true}
                userId={userId}
                onCountdownStart={() => setIsDetecting(true)}
                sendEvents={sendEvents}
              />
            )}
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
                const activeId = playedGameState.getActiveId(player.userId);
                const activeGame =
                  activeId == null
                    ? null
                    : (subcategoryIdToName.get(activeId) ?? null);
                return (
                  <Tooltip key={player.userId} label={player.name}>
                    <div>
                      <GameSelector
                        color={player.color}
                        game={activeGame}
                        onChange={
                          addSubcategoryName == null
                            ? null
                            : async (newGame: ProperGame | null) =>
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
              getCard(generalGoals[0], 475 - gameSelectorHeight)
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
          getCard(generalGoals[0], 475)
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
            {generalGoals.slice(1).map((g) => getCard(g, null))}
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
        generalGoals={generalGoals}
        showGameSelector={showGameSelector}
        setShowGameSelector={setShowGameSelector}
        highlightCurrentGame={highlightCurrentGame}
        setHighlightCurrentGame={setHighlightCurrentGame}
        showRecentGames={showRecentGames}
        setShowRecentGames={setShowRecentGames}
        addSubcategoryName={addSubcategoryName}
        isDetecting={isDetecting}
        setIsDetecting={setIsDetecting}
        gameToGoals={gameToGoals}
        setGeneralGameCount={setGeneralGameCount}
        countPosition={countPosition}
        setCountPosition={setCountPosition}
        font={font}
        setFont={setFont}
        timerState={timerState}
        players={players}
        casters={casters}
        sendEvents={sendEvents}
        members={allMembers}
        playedGameState={playedGameState}
        subcategoryIdToName={subcategoryIdToName}
      />
      {sendEvents != null && userId != null && editingIndex != null && (
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
