import { Fragment, useMemo, useRef, useState } from "react";
import { FullParsedGame } from "../fetchFeed";
import CastBoardWithTrackers from "../room/[id]/cast/CastBoardWithTrackers";
import getGameList from "../room/[id]/common/getGameList";
import usePasta from "../room/[id]/common/usePasta";
import useGeneralGoals from "../room/[id]/common/useGeneralGoals";
import useMembers from "../room/[id]/common/useMembers";
import { getGameToGoals } from "../room/[id]/cast/findAllGames";
import useGeneralCounts from "../room/[id]/cast/useGeneralCounts";
import useBoardState from "./[id]/useBoardState";
import useTeams from "../matches/useTeams";
import {
  ActionIcon,
  Group,
  Menu,
  Stack,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";
import {
  IconBrandTwitch,
  IconBrandYoutube,
  IconCamera,
  IconClock,
  IconDeviceTv,
  IconLink,
  IconList,
  IconSettings,
} from "@tabler/icons-react";
import { useMediaQuery } from "@mantine/hooks";
import html2canvas from "html2canvas";
import TeamPlayers from "../matches/TeamPlayers";
import TeamScoreCell from "../matches/TeamScoreCell";
import classes from "@/app/matches/MatchRow.module.css";
import useTeamsWithResults from "../matches/useTeamsWithResults";
import getFeedWithoutMistakes from "./[id]/getFeedWithoutMistakes";
import getOverlays from "./[id]/getOverlays";
import { getClockZeroTime } from "./[id]/MatchClock";
import NotStartedBoardCover from "../room/[id]/common/NotStartedBoardCover";
import PlayedGameState from "../room/[id]/cast/PlayedGameState";
import MatchPlaybackSlider from "./MatchPlaybackSlider";
import useIsEnded from "../room/[id]/common/useIsEnded";
import MatchDisplaySubmenus from "./MatchDisplaySubmenus";
import useLocalState from "../room/[id]/cast/useLocalState";
import useCountPosition from "../room/[id]/cast/useCountPosition";
import useFont from "../font/useFont";
import { useShouldShortenContext } from "../settings/ShouldShortenContext";
import Feed from "../room/[id]/common/Feed";
import EditVodModal from "../matches/EditVodModal";
import formatMatchDate from "../matches/formatMatchDate";
import { getVariantText } from "../matches/matchUtil";
import { displayTier } from "../matches/tier";
import { displayWeek } from "../matches/week";
import { getHost, getVodLink, setUrlAtTime } from "../matches/vodUtil";
import getBaseUrlAndHost from "../matches/getBaseUrlAndHost";
import {
  SCREENSHOT_HIDDEN_ATTR,
  SCREENSHOT_ONLY_ATTR,
  screenshotHiddenProps,
} from "./screenshotHidden";

type Props = {
  game: FullParsedGame;
};

export default function SingleMatchView({ game }: Props) {
  const pasta = usePasta(game);
  const squareNames = useMemo(
    () => game.squares.map((s) => s.name),
    [game.squares],
  );
  const gameList = useMemo(() => getGameList(pasta), [pasta]);
  const allGeneralGoals = useGeneralGoals(pasta, squareNames);
  const { shownDifficulties, setShownDifficulties, iconType, setIconType } =
    useLocalState(game.game.id);
  const [countPosition, setCountPosition] = useCountPosition();
  const [font, setFont] = useFont();
  const { shouldShortenCast, setShouldShortenCast } = useShouldShortenContext();
  // based on the full feed so the layout doesn't change while seeking
  const { hasCurrentSubcategories, hasGoalProgress } = useMemo(
    () => ({
      hasCurrentSubcategories: game.feed.some(
        (item) => item.type === "current_subcategory",
      ),
      hasGoalProgress: game.feed.some((item) => item.type === "goal_progress"),
    }),
    [game.feed],
  );
  const generalGoals = useMemo(
    () => (hasGoalProgress ? allGeneralGoals : []),
    [allGeneralGoals, hasGoalProgress],
  );
  const gameToGoals = useMemo(
    () => getGameToGoals(squareNames, Object.keys(gameList), pasta),
    [squareNames, gameList, pasta],
  );
  // TODO: figure out what to do with casters
  const { players, casters: _casters, allMembers } = useMembers(game.feed);
  const teamsMap = useTeams(players);
  const boardStateParams = useMemo(
    () => ({
      rows: game.game.rows,
      cols: game.game.cols,
      isLockout: game.game.isLockout,
    }),
    [game.game.cols, game.game.isLockout, game.game.rows],
  );

  const { hasStarted, matchStartTime, maxSeekSec } = useMemo(() => {
    const feed = game.feed;
    const hasStarted = feed.some(
      (item) => item.type === "timer_event" && item.event === "start",
    );
    const matchStartTime = hasStarted ? getClockZeroTime(feed) : null;
    // no playback if the clock never reached 0
    const maxSeekSec =
      matchStartTime != null && feed.length > 0
        ? Math.max(feed[feed.length - 1].time - matchStartTime, 0)
        : 0;
    return { hasStarted, matchStartTime, maxSeekSec };
  }, [game.feed]);
  const hasPlayback = maxSeekSec > 0;
  const [seekSec, setSeekSec] = useState(maxSeekSec);
  const curTime = (matchStartTime ?? 0) + seekSec;
  const endIndex = useMemo(() => {
    if (seekSec >= maxSeekSec) {
      return game.feed.length;
    }
    const endIndex = game.feed.findIndex((item) => item.time > curTime);
    return endIndex < 0 ? game.feed.length : endIndex;
  }, [curTime, game.feed, maxSeekSec, seekSec]);
  const shownFeed = useMemo(
    () =>
      endIndex >= game.feed.length ? game.feed : game.feed.slice(0, endIndex),
    [endIndex, game.feed],
  );

  const isFinal = shownFeed.length === game.feed.length;

  const feedWithoutMistakes = useMemo(
    () => getFeedWithoutMistakes(shownFeed, boardStateParams),
    [boardStateParams, shownFeed],
  );
  const teamsWithResults = useTeamsWithResults(
    teamsMap,
    feedWithoutMistakes,
    boardStateParams,
  );
  // Times are only shown for lockout matches
  const overlays = useMemo(
    () =>
      game.game.isLockout
        ? getOverlays(feedWithoutMistakes, game.game.rows * game.game.cols)
        : null,
    [feedWithoutMistakes, game.game.cols, game.game.isLockout, game.game.rows],
  );
  const isEnded = useIsEnded(game.feed);
  const hasWinner =
    isEnded &&
    teamsWithResults.length > 0 &&
    teamsWithResults[0].winType != null;
  const subcategoryIdToName = useMemo(
    () => new Map(game.subcategories.map((sc) => [sc.subcategoryId, sc.name])),
    [game.subcategories],
  );
  const feedPlayedGameState = useMemo(
    () => PlayedGameState.fromFeed(shownFeed),
    [shownFeed],
  );
  // treat games as paused at the current slider time so their times show accurately
  const playedGameState = useMemo(
    () => feedPlayedGameState.pausedAt(curTime),
    [curTime, feedPlayedGameState],
  );
  const generals = useGeneralCounts(
    shownFeed,
    game.squares,
    game.subcategories,
  );
  const boardState = useBoardState(shownFeed, boardStateParams);

  const isMobile = useMediaQuery("(max-width: 525px)");
  const [showFeed, setShowFeed] = useState(false);
  const [showTimes, setShowTimes] = useState(true);
  const [isEditingVod, setIsEditingVod] = useState(false);

  const ref = useRef<HTMLDivElement>(null);

  const info = game.game;
  const leagueGame = info.leagueGame;
  const getMemberName = (userId: number) => {
    const member = allMembers.get(userId);
    return member?.overrideName ?? member?.name ?? userId.toString();
  };
  const name =
    info.name ??
    (leagueGame != null
      ? `${getMemberName(leagueGame.p1Id)} vs ${getMemberName(leagueGame.p2Id)}`
      : "Unknown");
  const date = formatMatchDate(info.dateCreated);
  const subtitle =
    leagueGame == null
      ? `${date} — ${getVariantText(info)}`
      : `${date} — Season ${leagueGame.season}, Tier ${displayTier(leagueGame.tier)}, ${displayWeek(leagueGame.week)}`;

  const vod = info.vod;
  // rewind 90 seconds to get the lead-up to the reveal
  const vodLink = vod != null ? getVodLink(vod, -90) : "";
  let isTwitch = false;
  if (vod != null) {
    try {
      isTwitch = getHost(new URL(vod.url)) === "twitch";
    } catch {}
  }

  const vodUrl = vod?.url;
  const vodStartSeconds = vod?.startSeconds;
  const getFeedEntryLink = useMemo(() => {
    const urlAndHost = getBaseUrlAndHost(vodUrl);
    if (
      matchStartTime == null ||
      vodStartSeconds == null ||
      urlAndHost == null
    ) {
      return null;
    }
    const [baseUrl, host] = urlAndHost;
    return (time: number) => {
      const url = new URL(baseUrl);
      setUrlAtTime(host, url, vodStartSeconds + time - matchStartTime);
      return url.toString();
    };
  }, [matchStartTime, vodStartSeconds, vodUrl]);

  const copyImage = async () => {
    const element = ref.current;
    if (element == null) {
      return;
    }
    const width = element.offsetWidth;
    const canvas = await html2canvas(element, {
      onclone(_cloneDoc, clonedElement) {
        clonedElement
          .querySelectorAll<HTMLElement>(`[${SCREENSHOT_HIDDEN_ATTR}]`)
          .forEach((hidden) => {
            hidden.style.display = "none";
          });
        clonedElement
          .querySelectorAll<HTMLElement>(`[${SCREENSHOT_ONLY_ATTR}]`)
          .forEach((shown) => {
            shown.style.position = "static";
            shown.style.opacity = "1";
          });
        clonedElement.style.padding = "8px";
        clonedElement.style.width = `${width + 16}px`;
      },
      backgroundColor: "rgb(36, 36, 36)",
      scale: 4,
      // player avatars may be hosted on Discord
      useCORS: true,
    });
    canvas.toBlob((blob) => {
      if (blob == null) {
        return;
      }
      const item = new ClipboardItem({ "image/png": blob });
      navigator.clipboard.write([item]);
    });
  };

  return (
    <>
      <Stack>
        <div ref={ref}>
          <Stack gap={8}>
            <Group justify="space-between" align="start" wrap="nowrap">
              <Stack gap={4}>
                <Title order={3}>
                  {vodLink !== "" && (
                    <Tooltip label="Watch VOD">
                      <ActionIcon
                        {...screenshotHiddenProps}
                        style={{ marginRight: "8px" }}
                        size="sm"
                        component="a"
                        href={vodLink}
                        target="_blank"
                        color={isTwitch ? "violet" : "red"}
                        aria-label="Watch VOD"
                      >
                        {isTwitch ? (
                          <IconBrandTwitch size={16} />
                        ) : (
                          <IconBrandYoutube size={16} />
                        )}
                      </ActionIcon>
                    </Tooltip>
                  )}
                  {name}
                </Title>
                <Text>{subtitle}</Text>
              </Stack>
              <Group gap={4} wrap="nowrap" {...screenshotHiddenProps}>
                <Tooltip label="Copy match link">
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    size="lg"
                    onClick={() =>
                      navigator.clipboard.writeText(
                        `https://ufo50.bingo/match/${info.id}`,
                      )
                    }
                    aria-label="Copy match link"
                  >
                    <IconLink size={20} />
                  </ActionIcon>
                </Tooltip>
                <Tooltip label="Watch live board">
                  <ActionIcon
                    component="a"
                    href={`/watch/${info.id}`}
                    variant="subtle"
                    color="gray"
                    size="lg"
                    aria-label="Watch live board"
                    target="_blank"
                  >
                    <IconDeviceTv size={20} />
                  </ActionIcon>
                </Tooltip>
                <Tooltip
                  label={
                    <span>
                      Copy an image of the match.
                      <br />
                      Paste in the #bingo-chat channel to
                      <br />
                      share your results with the community!
                    </span>
                  }
                >
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    size="lg"
                    onClick={copyImage}
                    aria-label="Copy image to clipboard"
                  >
                    <IconCamera size={20} />
                  </ActionIcon>
                </Tooltip>
                <Menu shadow="md" width="auto" position="bottom-end">
                  <Menu.Target>
                    <ActionIcon
                      variant="subtle"
                      color="gray"
                      size="lg"
                      aria-label="Match settings"
                    >
                      <IconSettings size={20} />
                    </ActionIcon>
                  </Menu.Target>
                  <Menu.Dropdown>
                    {overlays != null && (
                      <Menu.Item
                        leftSection={<IconClock size={16} />}
                        onClick={() => setShowTimes(!showTimes)}
                      >
                        {showTimes ? "Hide Times" : "Show Times"}
                      </Menu.Item>
                    )}
                    <Menu.Item
                      leftSection={<IconList size={16} />}
                      onClick={() => setShowFeed(!showFeed)}
                    >
                      {showFeed ? "Hide Feed" : "Show Feed"}
                    </Menu.Item>
                    <Menu.Divider />
                    <MatchDisplaySubmenus
                      shownDifficulties={shownDifficulties}
                      setShownDifficulties={setShownDifficulties}
                      countPosition={countPosition}
                      setCountPosition={setCountPosition}
                      iconType={iconType}
                      setIconType={setIconType}
                      shouldShorten={shouldShortenCast}
                      setShouldShorten={setShouldShortenCast}
                      font={font}
                      setFont={setFont}
                    />
                    <Menu.Divider />
                    <Menu.Item
                      leftSection={<IconBrandYoutube size={16} />}
                      onClick={() => setIsEditingVod(true)}
                    >
                      {vodLink !== "" ? "Edit" : "Add"} VOD Link
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </Group>
            </Group>
            <Group align="start" wrap="nowrap" gap="md">
              <CastBoardWithTrackers
                game={game}
                pasta={pasta}
                countPosition={countPosition}
                showRecentGames={hasCurrentSubcategories}
                showSideColumns={hasCurrentSubcategories || hasGoalProgress}
                generalGoals={generalGoals}
                font={font}
                iconType={iconType}
                players={players}
                areGeneralGoalsHidden={!hasStarted}
                boardState={boardState}
                playedGameState={playedGameState}
                subcategoryIdToName={subcategoryIdToName}
                allMembers={allMembers}
                boardCover={hasStarted ? null : <NotStartedBoardCover />}
                gameList={gameList}
                gameToGoals={gameToGoals}
                shownDifficulties={shownDifficulties}
                generals={generals}
                tiebreakWinner={
                  isEnded &&
                  teamsWithResults.length > 0 &&
                  teamsWithResults[0].winType === "Tiebreak"
                    ? teamsWithResults[0].color
                    : null
                }
                canShowRecent={false}
                overlays={showTimes && overlays != null ? overlays : undefined}
                canShrink={true}
              />
              {showFeed && (
                <div style={{ flexShrink: 0 }}>
                  <Feed
                    feed={shownFeed}
                    boardStateParams={boardStateParams}
                    userId={null}
                    members={allMembers}
                    players={players}
                    squareNames={squareNames}
                    isPlay={false}
                    sendEvents={null}
                    getEntryLink={getFeedEntryLink}
                    style={{ height: `${95 * game.game.rows}px` }}
                  />
                </div>
              )}
            </Group>
            <Stack gap={4}>
              <div className={classes.teams} style={{ maxWidth: "360px" }}>
                {teamsWithResults.map((team, idx) => {
                  return (
                    <Fragment key={team.color}>
                      <TeamPlayers
                        team={team}
                        isWinner={team.winType != null}
                        isWinnerShown={isFinal && hasWinner}
                        size="lg"
                      />
                      <TeamScoreCell
                        team={team}
                        size="lg"
                        isWinnerShown={isFinal && hasWinner}
                        isInProgress={isFinal && !isEnded && idx === 0}
                      />
                    </Fragment>
                  );
                })}
              </div>
            </Stack>
            {hasPlayback && (
              <MatchPlaybackSlider
                seekSec={seekSec}
                setSeekSec={setSeekSec}
                maxSeekSec={maxSeekSec}
              />
            )}
          </Stack>
        </div>
      </Stack>
      {isEditingVod && (
        <EditVodModal
          matchesUrl={null}
          isMobile={isMobile}
          match={game}
          onClose={() => setIsEditingVod(false)}
        />
      )}
    </>
  );
}
