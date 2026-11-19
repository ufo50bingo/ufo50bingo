"use client";

import Board from "@/app/Board";
import { Button, Group, Stack, Text } from "@mantine/core";
import { useMemo } from "react";
import PlaySettings from "./PlaySettings";
import useShownDifficulties from "./useShownDifficulties";
import useSounds from "./useSounds";
import useWakeLock from "./useWakeLock";
import Feed from "../common/Feed";
import useFeedSocket from "../common/useFeedSocket";
import ScoreSquare from "../common/ScoreSquare";
import { useMediaQuery } from "@mantine/hooks";
import SimpleGeneralTracker from "./SimpleGeneralTracker";
import { CASTER_RESTRICTIONS, GeneralItem } from "../cast/Cast";
import useLocalBool from "@/app/localStorage/useLocalBool";
import useFont from "@/app/font/useFont";
import useSyncedTimer from "../common/useSyncedTimer";
import SyncedTimerBoardCover from "../common/SyncedTimerBoardCover";
import SyncedTimer from "../common/SyncedTimer";
import StartPauseButton from "../common/StartPauseButton";
import { PlayerTrackerRestrictions } from "@/app/generator/ufoGenerator";
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
import useBoardState from "@/app/match/[id]/useBoardState";
import { useServerOffsetContext } from "../ServerOffsetContext";
import StandardBoardWrapper from "@/app/StandardBoardWrapper";
import usePasta from "../common/usePasta";
import useGeneralGoals from "../common/useGeneralGoals";
import getFeedWithoutMistakes from "@/app/match/[id]/getFeedWithoutMistakes";
import useTeams from "@/app/matches/useTeams";
import useTeamsWithResults from "@/app/matches/useTeamsWithResults";
import { IconFlagCheck } from "@tabler/icons-react";
import EndMatchPopover from "../common/EndMatchPopover";
import useIsEnded from "../common/useIsEnded";

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
  const { getServerMsFromClientMs } = useServerOffsetContext();
  const [soundChoices, setSoundChoices, playAudio] = useSounds("play");
  const {
    feed,
    reconnectModal,
    sendEvents: sendEventsRaw,
  } = useFeedSocket({
    gameId,
    initialFeed,
    userId,
    playAudio,
    token,
    isPlay: true,
  });
  const sendEvents = sendEventsRaw!;
  const { players, casters, allMembers } = useMembers(feed);
  const boardStateParams = useMemo(
    () => ({ rows: game.rows, cols: game.cols, isLockout: game.isLockout }),
    [game.rows, game.cols, game.isLockout],
  );
  const boardState = useBoardState(feed, boardStateParams);
  const squareColors = useMemo(
    () => boardState.squares.map((colors) => [...colors]),
    [boardState],
  );
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
    image: selfMember.image,
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
  const isGeneralFinished = (g: GeneralItem) =>
    isLockout
      ? boardState.squares[g.squareIndex].size > 0
      : boardState.hasColor(g.squareIndex, selectedColor);

  const restrictions: PlayerTrackerRestrictions = useMemo(() => {
    if (override === "all") {
      return CASTER_RESTRICTIONS;
    }
    const restrictions = pasta?.player_tracker_restrictions;
    return (
      restrictions ?? {
        allowed_difficulty_tags: null,
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

  const feedWithoutMistakes = useMemo(
    () => getFeedWithoutMistakes(feed, boardStateParams),
    [boardStateParams, feed],
  );
  const teamsMap = useTeams(players);
  const teamsWithResults = useTeamsWithResults(
    teamsMap,
    feedWithoutMistakes,
    boardStateParams,
  );
  const tiebreakWinner =
    teamsWithResults.length > 0 && teamsWithResults[0].winType === "Tiebreak"
      ? teamsWithResults[0].color
      : null;

  const myScore =
    teamsWithResults.find((team) => team.color === selectedColor)?.score ?? 0;
  const opponent = teamsWithResults.find(
    (team) => team.color !== selectedColor,
  );

  const isHidden =
    (timerState.type === "not_started" && !timerState.isForceRevealed) ||
    (timerState.type === "countdown" &&
      !timerState.wasPaused &&
      !timerState.isForceRevealed);

  const boardHeight = game.rows * 95;

  const isEnded = useIsEnded(feed);
  return (
    <>
      <Group align="stretch">
        <Stack gap={8} style={{ minWidth: 0 }}>
          <StandardBoardWrapper rows={game.rows} columns={game.cols}>
            <Board
              pasta={pasta}
              squareNames={squareNames}
              squareColors={squareColors}
              onClickSquare={async (squareIndex) => {
                if (isEnded) {
                  return;
                }
                const isClear = boardState.hasColor(squareIndex, selectedColor);
                if (
                  !isClear &&
                  isLockout &&
                  boardState.squares[squareIndex].size > 0
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
              disabled={isEnded}
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
              isFinished={isGeneralFinished}
            />
          )}
          <Group>
            {isEnded ? (
              <Button
                disabled={true}
                color="red"
                w={132}
                leftSection={<IconFlagCheck size={16} />}
              >
                End match
              </Button>
            ) : (
              <EndMatchPopover
                userId={userId}
                isCast={false}
                hasCasters={casters.length > 0}
                sendEvents={sendEvents}
                button={
                  <Button
                    color="red"
                    w={132}
                    leftSection={<IconFlagCheck size={16} />}
                  >
                    End match
                  </Button>
                }
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
          </Group>
        </Stack>
        <Feed
          feed={feed}
          boardStateParams={boardStateParams}
          userId={userId}
          members={allMembers}
          players={players}
          squareNames={squareNames}
          isPlay={true}
          style={{
            height:
              showGeneralTracker && generalSettings.type === "simple"
                ? `${boardHeight + 273}px`
                : `${boardHeight + 117}px`,
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
              isFinished={isGeneralFinished(g)}
              terminalCodes={terminalCodes}
              countState={fullGeneralState[g.foundGoal.resolvedGoal]}
              showAll={showAll.includes(g.foundGoal.resolvedGoal)}
              setGeneralGameCount={setGeneralGameCount}
              addShowAll={addShowAll}
              generalTrackerPlayers={[selfPlayer]}
              style={{
                minHeight: "300px",
                maxHeight: `${boardHeight + 117}px`,
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
