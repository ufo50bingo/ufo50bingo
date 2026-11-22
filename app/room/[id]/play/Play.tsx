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
import { FoundGoal } from "@/app/findGoal";
import { CASTER_RESTRICTIONS } from "../cast/Cast";
import useLocalBool from "@/app/localStorage/useLocalBool";
import useFont from "@/app/font/useFont";
import useSyncedTimer from "../common/useSyncedTimer";
import SyncedTimerBoardCover from "../common/SyncedTimerBoardCover";
import SyncedTimer from "../common/SyncedTimer";
import StartPauseButton from "../common/StartPauseButton";
import {
  PlayerTrackerRestrictions,
  UFOPasta,
} from "@/app/generator/ufoGenerator";
import useGeneralSettings from "./useGeneralSettings";
import useFullGeneralState from "./useFullGeneralState";
import GeneralGoal from "../cast/GeneralGoal";
import useShowAll from "../common/useShowAll";
import { getAllTerminalCodes, getGameToGoals } from "../cast/findAllGames";
import getGameList from "../common/getGameList";
import { Game, ORDERED_GAMES } from "@/app/goals";
import GameInfo from "../cast/GameInfo";
import InfoCard from "../cast/InfoCard";
import { useSearchParams } from "next/navigation";
import { FeedColorMark, FullParsedGame } from "@/app/fetchFeed";
import useMembers, { PlayerMember } from "../common/useMembers";
import useSquareColors from "../common/useSquareColors";
import { useServerOffsetContext } from "../ServerOffsetContext";
import StandardBoardWrapper from "@/app/StandardBoardWrapper";
import usePasta from "../common/usePasta";
import useGeneralGoals from "../common/useGeneralGoals";

export type FoundItem = {
  foundGoal: FoundGoal<string, string, string>;
  pasta: UFOPasta;
  squareIndex: number;
};

export type Props = {
  game: FullParsedGame;
  userId: number;
  token: string;
};

export default function Play({ game: fullParsedGame, userId, token }: Props) {
  const { game, feed: initialFeed, squares } = fullParsedGame;
  const squareNames = useMemo(() => squares.map((s) => s.name), [squares]);
  const gameId = game.id;
  const isLockout = game.isLockout;
  const boardSize = game.rows * game.cols;
  const { getServerMsFromClientMs } = useServerOffsetContext();
  const [soundChoices, setSoundChoices, playAudio] = useSounds("play");
  const {
    feed,
    reconnectModal,
    sendEvents: sendEventsRaw,
  } = useBingosyncSocket({
    gameId,
    initialFeed,
    userId,
    playAudio,
    token,
  });
  // Play always has sendEvents available
  const sendEvents = sendEventsRaw!;
  const { players, casters, allMembers } = useMembers(feed);
  const squareColors = useSquareColors(feed, boardSize, isLockout);
  const searchParams = useSearchParams();
  const override = searchParams.get("override");

  const [showGeneralTrackerRaw, setShowGeneralTracker] = useLocalBool({
    key: "show_general_tracker",
    defaultValue: true,
  });
  const [font, setFont] = useFont();

  const selfMember = allMembers.get(userId)!;
  const selectedColor = selfMember.color ?? "red";
  const selfPlayer: PlayerMember = players.find((p) => p.userId === userId) ?? {
    userId,
    color: selectedColor,
    name: selfMember.overrideName ?? selfMember.name,
    isInvite: selfMember.isInvite,
  };

  // 525px is the width of the board, which is also the default width of the modal
  const isMobile = useMediaQuery("(max-width: 525px)");

  useWakeLock();

  const pasta = usePasta(fullParsedGame);

  const gameToGoals = useMemo(
    () => getGameToGoals(squareNames, Object.keys(getGameList(pasta)), pasta),
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

  const generalGoals = useGeneralGoals(pasta, squareNames);
  const showGeneralTracker = showGeneralTrackerRaw && generalGoals.length > 0;

  const restrictions: PlayerTrackerRestrictions = useMemo(() => {
    if (override === "all") {
      return CASTER_RESTRICTIONS;
    }
    const restrictions = pasta?.player_tracker_restrictions;
    return (
      restrictions ?? {
        allowed_difficulty_tags: ["general"],
        allow_fast_sort: false,
        show_on_card_tooltips: false,
        show_multi_goal_games: false,
      }
    );
  }, [override, pasta]);

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

  // TODO: Account for tiebreakers
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
    const highScoreOpponentColor = entries.find(
      (e) => e[0] !== selectedColor,
    )?.[0];
    const bestOpponentColor =
      highScoreOpponentColor ?? players.find((p) => p.userId !== userId)?.color;
    const bestOpponentEntry =
      bestOpponentColor == null
        ? null
        : {
            color: bestOpponentColor as BingosyncColor,
            score: scores[bestOpponentColor] ?? 0,
          };
    return [myScore, bestOpponentEntry];
  }, [squareColors, selectedColor, players, userId]);

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
          <StandardBoardWrapper rows={game.rows} columns={game.cols}>
            <Board
              pasta={pasta}
              board={squareColors.map((colors, index) => ({
                name: squareNames[index],
                color: colors.length > 0 ? colors[0] : "blank",
              }))}
              onClickSquare={async (squareIndex) => {
                const isClear =
                  squareColors[squareIndex].includes(selectedColor);
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
                  await sendEvents([feedItem]);
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
              rows={game.rows}
              columns={game.cols}
            />
          </StandardBoardWrapper>
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
                {opponent != null && (
                  <ScoreSquare
                    score={opponent.score}
                    color={opponent.color}
                    hasTiebreaker={tiebreakWinner === opponent?.color}
                    isDouble={false}
                    font={font}
                  />
                )}
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
              sendEvents={sendEvents}
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
            sendEvents={sendEvents}
            members={allMembers}
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
          sendEvents={sendEvents}
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
          restrictions.show_multi_goal_games && (
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
                        canShowTooltip={restrictions.show_on_card_tooltips}
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
