"use client";

import {
  Stack,
  Title,
  Group,
  Text,
  Tooltip,
  Button,
  Drawer,
  ActionIcon,
} from "@mantine/core";
import {
  IconClock,
  IconList,
  IconClipboard,
  IconBrandTwitch,
  IconBrandYoutube,
  IconLink,
  IconRefresh,
  IconTournament,
} from "@tabler/icons-react";
import html2canvas from "html2canvas";
import { useMemo, ReactNode, useRef, useState } from "react";
import Board from "../Board";
import BingosyncColored from "./BingosyncColored";
import { isTooOld, Match } from "./Matches";
import { getWinType, getVariantText } from "./matchUtil";
import { TBoard, Changelog } from "./parseBingosyncData";
import ViewChangelog from "./ViewChangelog";
import { getHost, getVodLink } from "./vodUtil";
import { getChangesWithoutMistakes, getMatchStartTime } from "./analyzeMatch";
import { refreshMatch } from "./refreshMatch";
import EditVodModal from "./EditVodModal";
import { useAppContext } from "../AppContextProvider";
import { db } from "../db";
import EditLeagueModal from "./EditLeagueModal";
import { useMediaQuery } from "@mantine/hooks";
import { LEAGUE_SEASON } from "../createboard/leagueConstants";
import useSession from "../session/useSession";
import { useRouter } from "next/navigation";
import runWithMaybeRefresh from "./runWithMaybeRefresh";
import getOverlays from "./getOverlays";
import WatchBoard from "./WatchBoard";

type Props = {
  match: Match;
  isMatchesPage: boolean;
};

export default function MatchView({ match, isMatchesPage }: Props) {
  const { hideByDefault, isMounted, revealedMatchIDs } = useAppContext();
  const router = useRouter();
  const session = useSession();
  const isAdmin = session?.admin ?? false;
  const isCreatorOrAdmin =
    (match.creatorID != null && match.creatorID === session?.id) || isAdmin;

  const canEdit =
    isCreatorOrAdmin &&
    match.variant === "Standard" &&
    match.isCustom === false &&
    LEAGUE_SEASON != null;

  const boardJson = match.boardJson;
  const board = useMemo<TBoard>(() => {
    if (boardJson == null) {
      return Array(25).fill({
        name: "BARBUTA: Collect the reward from a green skull",
        color: "blank",
      });
    }
    return JSON.parse(boardJson);
  }, [boardJson]);

  const changelogJson = match.changelogJson;
  const changelog: null | Changelog = useMemo(() => {
    if (changelogJson == null) {
      return null;
    }
    return JSON.parse(changelogJson);
  }, [changelogJson]);

  const analysisSeconds = match.analysisSeconds;
  const matchStartTime = useMemo(() => {
    if (changelog == null) {
      return null;
    }
    return getMatchStartTime(changelog, analysisSeconds);
  }, [changelog, analysisSeconds]);
  const overlays = useMemo<null | ReadonlyArray<ReactNode>>(() => {
    if (changelog == null) {
      return null;
    }
    const changes = getChangesWithoutMistakes(changelog.changes);
    return getOverlays(changes, matchStartTime);
  }, [changelog, matchStartTime]);

  const ref = useRef<HTMLDivElement>(null);
  const [showChangelog, setShowChangelog] = useState(false);
  const [showOverlays, setShowOverlays] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isEditingVod, setIsEditingVod] = useState(false);
  const [isEditingLeague, setIsEditingLeague] = useState(false);

  const winType = getWinType(match);

  let isTwitch = false;
  const vod = match.vod;
  if (vod != null) {
    const url = new URL(vod.url);
    const host = getHost(url);
    isTwitch = host === "twitch";
  }
  // rewind 90 seconds to get the lead-up to the reveal
  const vodLink = getVodLink(match, -90);
  const vodId = `vodLink_${match.id}`;
  const permalinkId = `permalink_${match.id}`;

  const leagueInfo = match.leagueInfo;
  const date = new Date(match.dateCreated * 1000).toLocaleString(undefined, {
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  });
  const subtitle =
    leagueInfo == null
      ? `${date} — ${getVariantText(match)}`
      : `${date} — Season ${leagueInfo.season}, Tier ${leagueInfo.tier}, ${leagueInfo.week}`;

  const isRevealed = !hideByDefault || revealedMatchIDs?.has(match.id);

  // 525px is the width of the board, which is also the default width of the modal
  const isMobile = useMediaQuery("(max-width: 525px)");

  const refreshItem = (
    <Button
      color="green"
      leftSection={<IconRefresh size={16} />}
      disabled={isTooOld(match.dateCreated) || isRefreshing}
      onClick={async () => {
        setIsRefreshing(true);
        await runWithMaybeRefresh(
          router,
          isMatchesPage,
          async () => await refreshMatch(match.id, board, changelog),
          () => setIsRefreshing(false),
        );
      }}
    >
      Refresh Data
    </Button>
  );

  const editItem = (
    <Button
      color="green"
      leftSection={<IconTournament size={16} />}
      disabled={!canEdit}
      onClick={() => setIsEditingLeague(true)}
    >
      Edit League Info
    </Button>
  );

  if (!isMounted || (hideByDefault && revealedMatchIDs == null)) {
    return null;
  }
  return (
    <>
      <Stack>
        <div style={{ maxWidth: "525px" }} ref={ref}>
          <Stack gap={8}>
            <Title order={3}>
              {vodLink !== "" && (
                <Tooltip label="Watch VOD">
                  <ActionIcon
                    id={vodId}
                    style={{ marginRight: "8px" }}
                    size="sm"
                    component="a"
                    href={vodLink}
                    target="_blank"
                    color={isTwitch ? "violet" : "red"}
                  >
                    {isTwitch ? (
                      <IconBrandTwitch size={16} />
                    ) : (
                      <IconBrandYoutube size={16} />
                    )}
                  </ActionIcon>
                </Tooltip>
              )}
              {match.name}
              <Tooltip label="Copy match link">
                <ActionIcon
                  id={permalinkId}
                  style={{ marginLeft: "8px" }}
                  size="sm"
                  onClick={() =>
                    navigator.clipboard.writeText(
                      `https://ufo50.bingo/match/${match.id}`,
                    )
                  }
                  variant="subtle"
                >
                  <IconLink size={16} />
                </ActionIcon>
              </Tooltip>
            </Title>
            <Text>{subtitle}</Text>
            <WatchBoard
              finalBoard={board}
              changes={changelog!.changes}
              startTime={matchStartTime!}
            />
            {isRevealed && (
              <Group justify="space-between">
                {match.winner != null && (
                  <BingosyncColored color={match.winner.color}>
                    <Text>
                      <strong>
                        {match.winner.name}: {match.winner.score}
                        {winType != null && ` (${winType} win)`}
                      </strong>
                    </Text>
                  </BingosyncColored>
                )}
                {match.opponent != null && (
                  <BingosyncColored color={match.opponent.color}>
                    <Text>
                      <strong>
                        {match.opponent.name}: {match.opponent.score}
                      </strong>
                    </Text>
                  </BingosyncColored>
                )}
              </Group>
            )}
          </Stack>
        </div>
        {isRevealed && match.isBoardVisible && (
          <Group justify="end">
            {overlays != null && (
              <Tooltip
                label={
                  <>
                    Times assume that the match started 1 min after
                    <br />
                    the card was first revealed.
                  </>
                }
              >
                <Button
                  leftSection={<IconClock size={16} />}
                  onClick={() => setShowOverlays(!showOverlays)}
                >
                  {showOverlays ? "Hide Times" : "Show Times"}
                </Button>
              </Tooltip>
            )}
            {changelog != null && (
              <Tooltip
                label={
                  <>
                    If a VOD with timestamp is linked to this match, you can
                    <br />
                    click on changelog items to view that time in the VOD.
                  </>
                }
              >
                <Button
                  size="sm"
                  leftSection={<IconList size={16} />}
                  onClick={() => setShowChangelog(!showChangelog)}
                >
                  {showChangelog ? "Hide Changelog" : "Show Changelog"}
                </Button>
              </Tooltip>
            )}
            <Tooltip
              label={
                <span>
                  Copies an image of the room name, date, board state, and
                  scores.
                  <br />
                  Paste in the #bingo-chat channel (linked in the page footer)
                  to
                  <br />
                  share your results with the community!
                </span>
              }
            >
              <Button
                leftSection={<IconClipboard size={16} />}
                onClick={async () => {
                  const board = ref.current;
                  if (board == null) {
                    return;
                  }
                  const canvas = await html2canvas(board, {
                    onclone(cloneDoc, element) {
                      const vodLink = cloneDoc.getElementById(vodId);
                      if (vodLink != null) {
                        vodLink.style.display = "none";
                      }
                      const permalink = cloneDoc.getElementById(permalinkId);
                      if (permalink != null) {
                        permalink.style.display = "none";
                      }
                      element.style.padding = "8px";
                      element.style.width = "541px";
                    },
                    backgroundColor: "rgb(36, 36, 36)",
                    scale: 4,
                  });
                  canvas.toBlob((blob) => {
                    if (blob == null) {
                      return;
                    }
                    const board = new ClipboardItem({ "image/png": blob });
                    navigator.clipboard.write([board]);
                  });
                }}
              >
                Copy to Clipboard
              </Button>
            </Tooltip>
          </Group>
        )}
        <Group justify="end">
          {isTooOld(match.dateCreated) ? (
            <Tooltip
              label={
                <>
                  Matches can only be refreshed within 1 day of their creation
                  <br />
                  because Bingosync deletes data about the match.
                </>
              }
            >
              {refreshItem}
            </Tooltip>
          ) : (
            refreshItem
          )}
          {!canEdit ? (
            <Tooltip label="You can only edit Standard matches you created.">
              {editItem}
            </Tooltip>
          ) : (
            editItem
          )}
          <Button
            color="green"
            leftSection={<IconBrandYoutube size={16} />}
            onClick={() => setIsEditingVod(true)}
          >
            {vodLink !== "" ? "Edit" : "Add"} VOD Link
          </Button>
        </Group>
      </Stack>
      <Drawer.Root
        size={300}
        position="right"
        opened={showChangelog}
        onClose={() => setShowChangelog(false)}
      >
        <Drawer.Content>
          <Drawer.Header>
            <Drawer.Title>Changelog</Drawer.Title>
            <Drawer.CloseButton />
          </Drawer.Header>
          <Drawer.Body>
            {changelog != null && (
              <ViewChangelog
                board={board}
                changelog={changelog}
                vod={
                  match.vod != null && match.vod.startSeconds != null
                    ? {
                        url: match.vod.url,
                        startSeconds: match.vod.startSeconds,
                      }
                    : null
                }
                analysisSeconds={match.analysisSeconds}
              />
            )}
          </Drawer.Body>
        </Drawer.Content>
      </Drawer.Root>
      {isEditingVod && (
        <EditVodModal
          isMatchesPage={isMatchesPage}
          isMobile={isMobile}
          match={match}
          onClose={() => setIsEditingVod(false)}
        />
      )}
      {isEditingLeague && (
        <EditLeagueModal
          isMatchesPage={isMatchesPage}
          isMobile={isMobile}
          match={match}
          onClose={() => setIsEditingLeague(false)}
        />
      )}
    </>
  );
}
