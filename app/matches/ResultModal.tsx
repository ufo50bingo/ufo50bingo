import {
  Button,
  Drawer,
  Group,
  Modal,
  Stack,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";
import { Match } from "./Matches";
import { ReactNode, useMemo, useRef, useState } from "react";
import Board from "../Board";
import html2canvas from "html2canvas";
import { IconClipboard, IconClock, IconList } from "@tabler/icons-react";
import { Changelog, TBoard } from "./parseBingosyncData";
import { getVariantText, getWinType } from "./matchUtil";
import BingosyncColored from "./BingosyncColored";
import ViewChangelog from "./ViewChangelog";
import {
  getChangesWithoutMistakes,
  getMatchStartTime,
  getSquareCompletionRanges,
} from "./analyzeMatch";

type Props = {
  match: Match;
  onClose: () => void;
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

export default function ResultModal({ match, onClose }: Props) {
  const boardJson = match.boardJson;
  const board = useMemo<TBoard>(() => {
    if (boardJson == null) {
      throw new Error("boardJson is null in ResultModal");
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

  const winType = getWinType(match);
  return (
    <Modal
      centered={true}
      onClose={onClose}
      opened={true}
      size="auto"
      withCloseButton={false}
    >
      <div ref={ref}>
        <Stack gap={8}>
          <Title order={3}>{match.name}</Title>
          <Text>
            {new Date(match.dateCreated * 1000).toLocaleString(undefined, {
              month: "numeric",
              day: "numeric",
              hour: "numeric",
              minute: "numeric",
            })}{" "}
            - {getVariantText(match)}
          </Text>
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
      <Group mt="lg" justify="space-between">
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
              const newDiv = board.cloneNode(true) as HTMLDivElement;
              newDiv.style.padding = "8px";
              newDiv.style.width = `${board.clientWidth}px`;
              document.body.appendChild(newDiv);
              const canvas = await html2canvas(newDiv, {
                backgroundColor: "rgb(36, 36, 36)",
                scale: 4,
              });
              document.body.removeChild(newDiv);
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
    </Modal>
  );
}
