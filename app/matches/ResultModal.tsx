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
import {
  IconCircleNumber1Filled,
  IconClipboard,
  IconList,
} from "@tabler/icons-react";
import { Change, Changelog, Board as TBoard } from "./parseBingosyncData";
import { getVariantText, getWinType } from "./matchUtil";
import BingosyncColored from "./BingosyncColored";
import ViewChangelog from "./ViewChangelog";

type Props = {
  match: Match;
  onClose: () => void;
};

function getOverlays(
  changes: ReadonlyArray<Change>
): ReadonlyArray<null | ReactNode> {
  const overlays: (null | number)[] = Array(25).fill(null);
  let count = 1;
  changes.forEach((change) => {
    if (change.color == "blank") {
      const oldOrder = overlays[change.index];
      overlays[change.index] = null;
      if (oldOrder != null) {
        for (let i = 0; i < 25; i++) {
          const thisOrder = overlays[i];
          if (thisOrder != null && thisOrder > oldOrder) {
            overlays[i] = thisOrder - 1;
          }
        }
      }
      count -= 1;
    } else {
      overlays[change.index] = count;
      count += 1;
    }
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

  const overlays = useMemo<null | ReadonlyArray<ReactNode>>(() => {
    if (changelog == null) {
      return null;
    }
    return getOverlays(changelog.changes);
  }, [changelog?.changes]);

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
          <Button
            leftSection={<IconCircleNumber1Filled size={16} />}
            onClick={() => setShowOverlays(!showOverlays)}
          >
            {showOverlays ? "Hide Order" : "Show Order"}
          </Button>
        )}
        {changelog != null && (
          <Button
            size="sm"
            leftSection={<IconList size={16} />}
            onClick={() => setShowChangelog(!showChangelog)}
          >
            {showChangelog ? "Hide Changelog" : "Show Changelog"}
          </Button>
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
              <ViewChangelog board={board} changelog={changelog} />
            )}
          </Drawer.Body>
        </Drawer.Content>
      </Drawer.Root>
    </Modal>
  );
}
