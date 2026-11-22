"use client";

import Board from "@/app/Board";
import { BingosyncColor } from "@/app/matches/parseBingosyncData";
import { Group, Stack, Text } from "@mantine/core";
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
import { AllPlayerGames } from "./useSyncedState";
import useLocalState from "./useLocalState";
import useBingosyncSocket from "../common/useBingosyncSocket";
import useSounds from "../play/useSounds";
import GameSelector from "./GameSelector";
import SideColumn from "./SideColumn";
import RecentGames from "./RecentGames";
import ScoreSquare from "../common/ScoreSquare";
import SideCell from "./SideCell";
import { STANDARD_UFO } from "@/app/pastas/standardUfo";
import findGoal, { FoundGoal, FoundGoalWithCast } from "@/app/findGoal";
import getGamesForPlayer from "./getGamesForPlayer";
import useLocalNumber from "@/app/localStorage/useLocalNumber";
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
import getIsNes50 from "../common/getIsNes50";
import { Restrictions, GeneralSettings } from "../play/GeneralSection";
import { EVERY_GAME_UFO } from "@/app/pastas/everyGameUfo";
import useCastRightClickBehavior from "./useCastRightClickBehavior";
import { RightClickBehaviorContext } from "@/app/settings/RightClickBehaviorContext";
import { NewFeed } from "@/app/fetchFeed";
import { GeneralCounts } from "./CastPage";
import useSquareColors from "../common/useSquareColors";
import useMembers from "../common/useMembers";

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
  gameId: number;
  initialFeed: NewFeed;
  userId: number;
  squareNames: ReadonlyArray<string>;
};

const COUNT_POSITION = ["side_by_side", "inset"] as const;
export type TCountPosition = (typeof COUNT_POSITION)[number];

export default function Cast({
  gameId,
  initialFeed,
  userId,
  squareNames,
}: CastProps) {
  const isLockout = true;
  const boardSize = 25;
  const [soundChoices, setSoundChoices, playAudio] = useSounds("cast");
  const { feed, reconnectModal } = useBingosyncSocket({
    gameId,
    initialFeed,
    userId,
    playAudio,
  });
  const members = useMembers(feed);
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

  const isNes50 = useMemo(() => getIsNes50(squareNames), [squareNames]);
  // TODO: Update getGameList to handle other pastas as well
  const gameToGoals = useMemo(
    () => getGameToGoals(squareNames, getGameList(isNes50)),
    [squareNames, isNes50],
  );
  const terminalCodes = useMemo(
    () => getAllTerminalCodes(squareNames),
    [squareNames],
  );
  const [editingIndex, setEditingIndex] = useState<null | number>(null);
  const [isDetecting, setIsDetecting] = useState(false);

  // TODO: Use leftUserId and rightUserId
  const [leftColor, rightColor]: [BingosyncColor, BingosyncColor] =
    useMemo(() => {
      return ["red", "blue"];
    }, []);

  // TODO: CountState should be a userId map
  const generals: GeneralCounts = useMemo(() => {
    return {};
  }, []);

  // TODO: use map for player IDs
  const allPlayerGames: AllPlayerGames = useMemo(() => {
    return [];
  }, []);

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

  const gameList = useMemo(() => getGameList(isNes50), [isNes50]);

  const { timerState, forceReveal } = useSyncedTimer({
    gameId,
    feed,
    playAudio,
    isCast: false,
    members,
  });

  const [generalOrder, setGeneralOrder] = useLocalEnum({
    key: "general-order",
    options: GENERAL_ORDER,
    defaultValue: "reading",
  });

  const [font, setFont] = useFont();
  const [numPlayers, setNumPlayers] = useLocalNumber({
    key: "num-players",
    defaultValue: 2,
  });

  const [countPosition, setCountPosition] = useLocalEnum({
    key: "count-position",
    defaultValue: "side_by_side",
    options: COUNT_POSITION,
  });

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
        let foundGoal: null | FoundGoal<string, string, string> = null;
        foundGoal = findGoal(name, STANDARD_UFO);
        let pasta: UFOPasta = STANDARD_UFO;
        if (foundGoal == null) {
          foundGoal = findGoal(name, NES_50_UFO);
          pasta = NES_50_UFO;
        }
        if (foundGoal == null) {
          foundGoal = findGoal(name, EVERY_GAME_UFO);
          pasta = EVERY_GAME_UFO;
        }
        if (foundGoal == null || foundGoal.cast == null) {
          return null;
        }
        return {
          foundGoal: foundGoal as FoundStandardGeneral,
          pasta,
          squareIndex,
        };
      })
      .filter((item) => item != null);
  }, [squareNames]);

  // TODO: Fix this
  const sortedGenerals = useMemo<ReadonlyArray<GeneralItem>>(() => {
    const correctOrder = Object.keys(STANDARD_UFO.goals.general);
    return generalGoals.toSorted((a, b) => {
      const aIdx = correctOrder.indexOf(a.foundGoal.subcategory);
      const bIdx = correctOrder.indexOf(b.foundGoal.subcategory);
      return aIdx - bIdx;
    });
  }, [generalGoals]);

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

  const getCard = (g: GeneralItem, h: null | undefined | number) => (
    <GeneralGoal
      key={g.foundGoal.resolvedGoal}
      gameToGoals={gameToGoals}
      foundGoal={g.foundGoal}
      // TODO: Use server action
      setGeneralGameCount={() => {}}
      // TODO: Determine whether all colors have marked this
      isFinished={isLockout && squareColors[g.squareIndex].length > 0}
      terminalCodes={terminalCodes}
      countState={generals[g.foundGoal.resolvedGoal]}
      showAll={showAll.includes(g.foundGoal.resolvedGoal)}
      addShowAll={addShowAll}
      playerColors={[leftColor, rightColor]}
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
    const currentGames = allPlayerGames.map((playerGames) =>
      playerGames == null ? null : playerGames[0],
    );
    const currentLeftGames = currentGames.filter(
      (g, index) => g != null && index % 2 === 0,
    );
    const currentRightGames = currentGames.filter(
      (g, index) => g != null && index % 2 === 1,
    );
    const leftIndices = currentLeftGames
      .flatMap((game) =>
        game?.game != null ? (gameToGoals[game.game] ?? []) : [],
      )
      .map((item) => item[1]);
    const rightIndices = currentRightGames
      .flatMap((game) =>
        game?.game != null ? (gameToGoals[game.game] ?? []) : [],
      )
      .map((item) => item[1]);
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

  const isDouble = generalGoals.length > 0 && countPosition === "side_by_side";

  const areGeneralIconsHidden =
    hideByDefault &&
    ((timerState.type === "not_started" && !timerState.isForceRevealed) ||
      (timerState.type === "countdown" &&
        !timerState.wasPaused &&
        !timerState.isForceRevealed));
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
                isNes50={isNes50}
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
              playerNum={0}
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
                isNes50={isNes50}
              />
            )}
          </SideColumn>
          <Board
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
          />
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
              playerNum={1}
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
                isNes50={isNes50}
              />
            )}
          </SideColumn>
          {showRecentGames && generalGoals.length > 0 && (
            <SideColumn isDouble={false}>
              <RecentGames
                limit={6}
                recentGames={rightGames}
                font={font}
                isNes50={isNes50}
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
              gameId={gameId}
              onCountdownStart={() => setIsDetecting(true)}
            />
          </Group>
          <Feed
            feed={feed}
            userId={userId}
            members={members}
            squareNames={squareNames}
            isPlay={false}
            style={{ height: `${475 - 44}px` }}
          />
        </Stack>
        {showGameSelector ? (
          <Stack gap={8}>
            <Group wrap="wrap" w={268} gap={8} justify="space-between">
              {new Array(numPlayers).fill(null).map((_, playerNum) => (
                <GameSelector
                  key={playerNum}
                  color={playerNum % 2 === 0 ? leftColor : rightColor}
                  game={
                    getGamesForPlayer(allPlayerGames, playerNum)[0]?.game ??
                    null
                  }
                  onChange={(_newGame: ProperGame | null) => {
                    // TODO: Call server action here
                    // addGame(newGame, playerNum);
                  }}
                  terminalCodes={terminalCodes}
                  gameList={gameList}
                />
              ))}
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
        gameId={gameId}
        leftColor={leftColor}
        rightColor={rightColor}
        // TODO: add server actions
        setLeftColor={() => {}}
        setRightColor={() => {}}
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
        leftScore={leftScore}
        rightScore={rightScore}
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
        numPlayers={numPlayers}
        setNumPlayers={setNumPlayers}
        allPlayerGames={allPlayerGames}
        // TODO: add server actions
        addGame={() => {}}
        isDetecting={isDetecting}
        setIsDetecting={setIsDetecting}
        gameToGoals={gameToGoals}
        // TODO: add server actions
        setGeneralGameCount={() => {}}
        countPosition={countPosition}
        setCountPosition={setCountPosition}
        generalOrder={generalOrder}
        setGeneralOrder={setGeneralOrder}
        font={font}
        setFont={setFont}
        timerState={timerState}
      />
      {editingIndex != null && (
        <EditSquare
          gameId={gameId}
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
