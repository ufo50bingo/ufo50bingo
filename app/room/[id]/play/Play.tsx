"use client";

import Board from "@/app/Board";
import { BingosyncColor } from "@/app/matches/parseBingosyncData";
import { Group, Stack, Text } from "@mantine/core";
import { useMemo } from "react";
import PlaySettings from "./PlaySettings";
import useShownDifficulties from "./useShownDifficulties";
import useSounds from "./useSounds";
import useWakeLock from "./useWakeLock";
import changeColor from "../cast/changeColor";
import Feed from "../common/Feed";
import useBingosyncSocket from "../common/useBingosyncSocket";
import ScoreSquare from "../common/ScoreSquare";
import { useMediaQuery } from "@mantine/hooks";
import SimpleGeneralTracker from "./SimpleGeneralTracker";
import findGoal, { FoundGoal } from "@/app/findGoal";
import { STANDARD_UFO } from "@/app/pastas/standardUfo";
import { GeneralItem } from "../cast/Cast";
import useLocalBool from "@/app/localStorage/useLocalBool";
import useFont from "@/app/font/useFont";
import useSyncedTimer from "../common/useSyncedTimer";
import SyncedTimerBoardCover from "../common/SyncedTimerBoardCover";
import SyncedTimer from "../common/SyncedTimer";
import StartPauseButton from "../common/StartPauseButton";
import { UFOPasta } from "@/app/generator/ufoGenerator";
import { NES_50_UFO } from "@/app/pastas/nes50Ufo";
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
import { useSearchParams } from "next/navigation";
import { Restrictions } from "./GeneralSection";
import { NewFeed } from "@/app/fetchFeed";
import useMembers from "../common/useMembers";
import useSquareColors from "../common/useSquareColors";

export type FoundItem = {
  foundGoal: FoundGoal<string, string, string>;
  pasta: UFOPasta;
  squareIndex: number;
};

export type Props = {
  gameId: number;
  initialFeed: NewFeed;
  userId: number;
  squareNames: ReadonlyArray<string>;
};

export default function Play({
  gameId,
  initialFeed,
  userId,
  squareNames,
}: Props) {
  const isLockout = true;
  const boardSize = 25;
  const [soundChoices, setSoundChoices, playAudio] = useSounds("play");
  const { feed, reconnectModal } = useBingosyncSocket({
    gameId,
    initialFeed,
    userId,
    playAudio,
  });
  const { allMembers } = useMembers(feed);
  const squareColors = useSquareColors(feed, boardSize, isLockout);
  const searchParams = useSearchParams();
  const override = searchParams.get("override");

  const [showGeneralTrackerRaw, setShowGeneralTracker] = useLocalBool({
    key: "show_general_tracker",
    defaultValue: true,
  });
  const [font, setFont] = useFont();

  const selfUser = allMembers.get(userId)!;
  const selectedColor = selfUser.color ?? "red";

  // 525px is the width of the board, which is also the default width of the modal
  const isMobile = useMediaQuery("(max-width: 525px)");

  useWakeLock();

  const gameToGoals = useMemo(
    () => getGameToGoals(squareNames, getGameList(getIsNes50(squareNames))),
    [squareNames],
  );
  const terminalCodes = useMemo(
    () => getAllTerminalCodes(squareNames),
    [squareNames],
  );

  const { timerState, forceReveal } = useSyncedTimer({
    gameId,
    feed,
    playAudio,
    isCast: false,
    members: allMembers,
  });

  const foundItems = useMemo<ReadonlyArray<FoundItem>>(() => {
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
        if (foundGoal == null) {
          return null;
        }
        return {
          foundGoal,
          pasta,
          squareIndex,
        };
      })
      .filter((item) => item != null);
  }, [squareNames]);

  const generalGoals = useMemo<ReadonlyArray<GeneralItem>>(() => {
    return foundItems.filter(
      (foundItem) => foundItem.foundGoal.cast != null,
    ) as ReadonlyArray<GeneralItem>;
  }, [foundItems]);
  const showGeneralTracker = showGeneralTrackerRaw && generalGoals.length > 0;

  const restrictions: Restrictions = useMemo(() => {
    if (override === "all") {
      return {
        canTagDifficultyFor: null,
        canUseFull: true,
        canFilterOnCard: true,
        canShowOnCardTooltips: true,
        canFastSort: true,
        canSegment: true,
        canUseTerminalCodes: true,
        canShowMultiGoalGames: true,
      };
    }
    const isNes50 =
      (generalGoals.length >= 5 &&
        generalGoals.every((item) => item.pasta === NES_50_UFO)) ||
      foundItems.filter((item) => item.pasta === NES_50_UFO).length > 15;
    if (isNes50) {
      return {
        canTagDifficultyFor: null,
        canUseFull: true,
        canFilterOnCard: true,
        canShowOnCardTooltips: false,
        canFastSort: false,
        canSegment: true,
        canUseTerminalCodes: false,
        canShowMultiGoalGames: true,
      };
    }
    const isEveryGame =
      (generalGoals.length >= 5 &&
        generalGoals.every((item) => item.pasta === EVERY_GAME_UFO)) ||
      foundItems.filter((item) => item.pasta === EVERY_GAME_UFO).length > 15;
    if (isEveryGame) {
      return {
        canTagDifficultyFor: null,
        canUseFull: true,
        canFilterOnCard: true,
        canShowOnCardTooltips: true,
        canFastSort: true,
        canSegment: true,
        canUseTerminalCodes: true,
        canShowMultiGoalGames: true,
      };
    }
    // is UFO 50
    return {
      canTagDifficultyFor: ["general"],
      canUseFull: true,
      canFilterOnCard: true,
      canShowOnCardTooltips: false,
      canFastSort: false,
      canSegment: true,
      canUseTerminalCodes: true,
      canShowMultiGoalGames: false,
    };
  }, [generalGoals, foundItems, override]);

  const [shownDifficulties, setShownDifficulties] =
    useShownDifficulties(restrictions);
  const [generalSettings, generalSetters] = useGeneralSettings(restrictions);
  const [fullGeneralState, setGeneralGameCount] = useFullGeneralState(
    gameId,
    userId,
  );
  const [showAll, addShowAll] = useShowAll(`player-showall-${gameId}`);

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
    squareColors.forEach((colors) => {
      for (const color of colors) {
        const score = scores[color] ?? 0;
        scores[color] = score + 1;
      }
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
  }, [selectedColor, squareColors]);

  const tiebreakWinner = null;
  // const tiebreakWinner = useMemo<BingosyncColor | null>(() => {
  //   try {
  //     if (
  //       opponent == null ||
  //       myScore !== opponent.score ||
  //       selectedColor === opponent.color
  //     ) {
  //       return null;
  //     }
  //     const changelog = getChangelog(rawFeed);
  //     const result = getResult(board, changelog.changes, null, null);
  //     if (result == null) {
  //       return null;
  //     }
  //     const isValid =
  //       result.winnerScore === myScore &&
  //       result.opponentScore === myScore &&
  //       (result.winnerColor === selectedColor ||
  //         result.winnerColor === opponent.color) &&
  //       (result.opponentColor === selectedColor ||
  //         result.opponentColor === opponent.color);
  //     if (!isValid) {
  //       return null;
  //     }
  //     return result.winnerColor as BingosyncColor;
  //   } catch {
  //     return null;
  //   }
  // }, [opponent, myScore, selectedColor, rawFeed, board]);

  const isHidden =
    (timerState.type === "not_started" && !timerState.isForceRevealed) ||
    (timerState.type === "countdown" &&
      !timerState.wasPaused &&
      !timerState.isForceRevealed);
  return (
    <>
      <Group align="stretch">
        <Stack gap={8}>
          <Board
            board={squareColors.map((colors, index) => ({
              name: squareNames[index],
              color: colors.length > 0 ? colors[0] : "blank",
            }))}
            onClickSquare={async (squareIndex) => {
              const isClearing =
                squareColors[squareIndex].includes(selectedColor);
              try {
                await changeColor(
                  gameId,
                  squareIndex,
                  selectedColor,
                  isClearing,
                );
              } catch {}
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
            isPlay={true}
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
              gameId={gameId}
            />
          </Group>
          {showGeneralTracker && generalSettings.type === "simple" && (
            <SimpleGeneralTracker
              isHidden={isHidden}
              gameId={gameId}
              generalGoals={generalGoals}
            />
          )}
          <PlaySettings
            gameId={gameId}
            color={selectedColor}
            // TODO: Allow changing color
            setColor={() => {}}
            shownDifficulties={shownDifficulties}
            setShownDifficulties={setShownDifficulties}
            soundChoices={soundChoices}
            setSoundChoices={setSoundChoices}
            isMobile={isMobile}
            showGeneralTracker={showGeneralTracker}
            setShowGeneralTracker={setShowGeneralTracker}
            font={font}
            setFont={setFont}
            timerState={timerState}
            forceReveal={forceReveal}
            generalSettings={generalSettings}
            generalSetters={generalSetters}
            restrictions={restrictions}
          />
        </Stack>
        <Feed
          feed={feed}
          userId={userId}
          members={allMembers}
          squareNames={squareNames}
          isPlay={true}
          style={{
            height:
              showGeneralTracker && generalSettings.type === "simple"
                ? "748px"
                : "592px",
          }}
        />
        {!isHidden &&
          showGeneralTracker &&
          generalSettings.type === "full" &&
          generalGoals.map((g) => (
            <GeneralGoal
              key={g.foundGoal.resolvedGoal}
              gameToGoals={gameToGoals}
              foundGoal={g.foundGoal}
              isFinished={
                isLockout
                  ? squareColors[g.squareIndex].length > 0
                  : squareColors[g.squareIndex].includes(selectedColor)
              }
              terminalCodes={terminalCodes}
              countState={fullGeneralState[g.foundGoal.resolvedGoal]}
              showAll={showAll.includes(g.foundGoal.resolvedGoal)}
              setGeneralGameCount={setGeneralGameCount}
              addShowAll={addShowAll}
              generalTrackerPlayers={[{ userId, color: selectedColor }]}
              style={{
                minHeight: "300px",
                maxHeight: "592px",
                flex: "1 1 auto",
              }}
              settings={generalSettings}
              pasta={g.pasta}
              restrictions={restrictions}
            />
          ))}
        {!isHidden &&
          showGeneralTracker &&
          generalSettings.type === "full" &&
          restrictions.canShowMultiGoalGames && (
            <InfoCard
              title="Multi-goal games"
              style={{
                minHeight: "300px",
                maxHeight: "592px",
                flex: "1 1 auto",
              }}
            >
              <Stack gap={4}>
                {multiGoalGames.length > 0
                  ? multiGoalGames.map((game) => (
                      <GameInfo
                        key={game}
                        game={game as Game}
                        goals={gameToGoals[game]}
                        description={null}
                        canShowTooltip={restrictions.canShowOnCardTooltips}
                      />
                    ))
                  : "No multi-goal games on this card!"}
              </Stack>
            </InfoCard>
          )}
      </Group>
      {reconnectModal}
    </>
  );
}
