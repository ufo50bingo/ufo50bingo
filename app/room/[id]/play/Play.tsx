"use client";

import Board from "@/app/Board";
import { BingosyncColor } from "@/app/matches/parseBingosyncData";
import { Group, Stack, Text } from "@mantine/core";
import { useMemo } from "react";
import PlaySettings from "./PlaySettings";
import useShownDifficulties from "./useShownDifficulties";
import useSounds from "./useSounds";
import useWakeLock from "./useWakeLock";
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
import { FeedColorMark, NewFeed } from "@/app/fetchFeed";
import useMembers from "../common/useMembers";
import useSquareColors from "../common/useSquareColors";
import { useServerOffsetContext } from "../ServerOffsetContext";
import { getMatchingRepoPasta } from "@/app/getMatchingRepoPasta";

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
  token: string;
  pastaId: null | bigint;
  fetchedPasta: null | UFOPasta;
};

export default function Play({
  gameId,
  initialFeed,
  userId,
  squareNames,
  token,
  pastaId,
  fetchedPasta,
}: Props) {
  const isLockout = true;
  const boardSize = 25;
  const { getServerMsFromClientMs } = useServerOffsetContext();
  const [soundChoices, setSoundChoices, playAudio] = useSounds("play");
  const { feed, reconnectModal, sendEvent } = useBingosyncSocket({
    gameId,
    initialFeed,
    userId,
    playAudio,
    token,
  });
  const { players, casters, allMembers } = useMembers(feed);
  const squareColors = useSquareColors(feed, boardSize, isLockout);
  const searchParams = useSearchParams();
  const override = searchParams.get("override");

  const [showGeneralTrackerRaw, setShowGeneralTracker] = useLocalBool({
    key: "show_general_tracker",
    defaultValue: true,
  });
  const [font, setFont] = useFont();

  const selfPlayer = players.find((p) => p.userId === userId)!;
  const selectedColor = selfPlayer.color;

  // 525px is the width of the board, which is also the default width of the modal
  const isMobile = useMediaQuery("(max-width: 525px)");

  useWakeLock();

  const pasta = useMemo(() => {
    if (pastaId == null) {
      return null;
    }
    if (fetchedPasta != null) {
      return fetchedPasta;
    }
    return getMatchingRepoPasta(pastaId);
  }, [fetchedPasta, pastaId]);

  const gameToGoals = useMemo(
    () =>
      getGameToGoals(
        squareNames,
        getGameList(pasta === NES_50_UFO || getIsNes50(squareNames)),
        pasta,
      ),
    [pasta, squareNames],
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
        const pastasToCheck =
          pasta != null ? [pasta] : [STANDARD_UFO, NES_50_UFO, EVERY_GAME_UFO];
        for (const pastaToCheck of pastasToCheck) {
          const foundGoal = findGoal(name, pastaToCheck);
          if (foundGoal != null) {
            if (foundGoal.cast == null) {
              return null;
            }
            return {
              foundGoal,
              pasta: pastaToCheck,
              squareIndex,
            };
          }
        }
        return null;
      })
      .filter((item) => item != null);
  }, [pasta, squareNames]);

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
      pasta === NES_50_UFO ||
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
      pasta === EVERY_GAME_UFO ||
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
  }, [override, pasta, generalGoals, foundItems]);

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
            pasta={pasta}
            board={squareColors.map((colors, index) => ({
              name: squareNames[index],
              color: colors.length > 0 ? colors[0] : "blank",
            }))}
            onClickSquare={async (squareIndex) => {
              const isClear = squareColors[squareIndex].includes(selectedColor);
              if (
                !isClear &&
                isLockout &&
                squareColors[squareIndex].length > 0
              ) {
                return;
              }
              try {
                const feedItem: FeedColorMark = {
                  type: "color_mark",
                  time: getServerMsFromClientMs(Date.now()) / 1000,
                  userId,
                  color: selectedColor,
                  squareIndex,
                  isClear,
                };
                await sendEvent(feedItem);
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
              userId={userId}
              sendEvent={sendEvent}
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
            userId={userId}
            color={selectedColor}
            players={players}
            casters={casters}
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
            sendEvent={sendEvent}
          />
        </Stack>
        <Feed
          feed={feed}
          userId={userId}
          members={allMembers}
          players={players}
          squareNames={squareNames}
          isPlay={true}
          style={{
            height:
              showGeneralTracker && generalSettings.type === "simple"
                ? "748px"
                : "592px",
          }}
          sendEvent={sendEvent}
        />
        {!isHidden &&
          showGeneralTracker &&
          generalSettings.type === "full" &&
          generalGoals.map((g) => (
            <GeneralGoal
              key={g.foundGoal.resolvedGoal}
              isPlay={true}
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
              generalTrackerPlayers={[selfPlayer]}
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
