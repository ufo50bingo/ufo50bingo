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
import { useMemo, useRef, useState } from "react";
import Board from "../Board";
import html2canvas from "html2canvas";
import { IconClipboard, IconList } from "@tabler/icons-react";
import { Board as TBoard } from "./parseBingosyncData";
import { getVariantText, getWinType } from "./matchUtil";
import BingosyncColored from "./BingosyncColored";
import ViewChangelog from "./ViewChangelog";

type Props = {
  match: Match;
  onClose: () => void;
};

export default function ResultModal({ match, onClose }: Props) {
  const boardJson = match.boardJson;
  const board = useMemo<TBoard>(() => {
    if (boardJson == null) {
      return null;
    }
    return JSON.parse(boardJson);
  }, [boardJson]);
  const ref = useRef<HTMLDivElement>(null);

  const [showChangelog, setShowChangelog] = useState(false);

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
      <Group mt="lg" justify="flex-end">
        {match.changelogJson != null && (
          <Button
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
            {match.changelogJson != null && (
              <ViewChangelog
                board={board}
                changelogJson={match.changelogJson}
              />
            )}
          </Drawer.Body>
        </Drawer.Content>
      </Drawer.Root>
    </Modal>
  );
}
