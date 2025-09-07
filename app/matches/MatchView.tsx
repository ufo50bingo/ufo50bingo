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
import {
  getChangesWithoutMistakes,
  getMatchStartTime,
  getSquareCompletionRanges,
} from "./analyzeMatch";
import { refreshMatch } from "./refreshMatch";
import EditVodModal from "./EditVodModal";

type Props = {
  isModal: boolean;
  match: Match;
};

function getOverlays(
  changelog: Changelog,
  analysisSeconds: number
): ReadonlyArray<null | ReactNode> {
  const orders: (null | number)[] = Array(25).fill(null);
  let count = 1;
  const matchStartTime = getMatchStartTime(changelog, analysisSeconds);
  const changes = getChangesWithoutMistakes(changelog.changes);
  const ranges = getSquareCompletionRanges(matchStartTime, changes);
  changes.forEach((change) => {
    if (change.color == "blank") {
      const oldOrder = orders[change.index];
      orders[change.index] = null;
      if (oldOrder != null) {
        for (let i = 0; i < 25; i++) {
          const thisOrder = orders[i];
          if (thisOrder != null && thisOrder > oldOrder) {
            orders[i] = thisOrder - 1;
          }
        }
      }
      count -= 1;
    } else {
      orders[change.index] = count;
      count += 1;
    }
  });

  const overlays = Array(25)
    .fill(null)
    .map((_, index) => {
      const order = orders[index];
      const orderStr = order == null ? "#?" : `#${order}`;

      const range = ranges[index];
      if (order == null && range == null) {
        return null;
      }

      const timeStr =
        range != null ? ((range[2] - range[1]) / 60).toFixed(1) : null;

      let finalOverlay = orderStr;
      if (timeStr != null) {
        finalOverlay += `, ${timeStr}m`;
      }
      return finalOverlay;
    });
  return overlays;
}

export default function MatchView({ isModal, match }: Props) {
  const boardJson = match.boardJson;
  const board = useMemo<TBoard>(() => {
    if (boardJson == null) {
      throw new Error("boardJson is null in MatchView");
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
  const overlays = useMemo<null | ReadonlyArray<ReactNode>>(() => {
    if (changelog == null) {
      return null;
    }
    return getOverlays(changelog, analysisSeconds);
  }, [changelog, analysisSeconds]);

  const ref = useRef<HTMLDivElement>(null);
  const [showChangelog, setShowChangelog] = useState(false);
  const [showOverlays, setShowOverlays] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isEditingVod, setIsEditingVod] = useState(false);

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

  const refreshItem = (
    <Button
      color="green"
      leftSection={<IconRefresh size={16} />}
      disabled={isTooOld(match.dateCreated) || isRefreshing}
      onClick={async () => {
        setIsRefreshing(true);
        try {
          await refreshMatch(match.id);
        } finally {
          setIsRefreshing(false);
        }
      }}
    >
      Refresh Data
    </Button>
  );

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
                    navigator.clipboard.writeText(window.location.href)
                  }
                  variant="subtle"
                >
                  <IconLink size={16} />
                </ActionIcon>
              </Tooltip>
            </Title>
            <Text>{subtitle}</Text>
            <Board
              board={board}
              overlays={showOverlays && overlays != null ? overlays : undefined}
              onClickSquare={null}
              isHidden={false}
              setIsHidden={() => {}}
            />
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
          </Stack>
        </div>
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
                Copies an image of the room name, date, board state, and scores.
                <br />
                Paste in the #bingo-chat channel (linked in the page footer) to
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
                    element.className;
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
        {isModal === false && (
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
            <Button
              color="green"
              leftSection={<IconBrandYoutube size={16} />}
              onClick={() => setIsEditingVod(true)}
            >
              {vodLink !== "" ? "Edit" : "Add"} VOD Link
            </Button>
          </Group>
        )}
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
          isMobile={false}
          match={match}
          onClose={() => setIsEditingVod(false)}
        />
      )}
    </>
  );
}
