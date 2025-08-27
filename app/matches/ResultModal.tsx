import {
  Button,
  Group,
  Modal,
  Stack,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";
import { Match } from "./Matches";
import { RawSquare } from "./refreshMatch";
import { useMemo, useRef } from "react";
import Board from "../Board";
import html2canvas from "html2canvas";
import PlayerName from "./PlayerName";
import { IconClipboard } from "@tabler/icons-react";

type Props = {
  match: Match;
  onClose: () => void;
};

export default function ResultModal({ match, onClose }: Props) {
  const boardJson = match.boardJson;
  const board = useMemo<ReadonlyArray<RawSquare>>(() => {
    if (boardJson == null) {
      return null;
    }
    return JSON.parse(boardJson);
  }, [boardJson]);
  const ref = useRef<HTMLDivElement>(null);
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
          <Title order={4}>
            {match.name} -{" "}
            {new Date(match.dateCreated * 1000).toLocaleString(undefined, {
              month: "numeric",
              day: "numeric",
              hour: "numeric",
              minute: "numeric",
            })}
          </Title>
          <Board
            rows={board}
            onClickSquare={null}
            isHidden={false}
            setIsHidden={() => {}}
          />
          <Group justify="space-between">
            {match.winner != null && (
              <PlayerName color={match.winner.color}>
                <Text>
                  <strong>
                    {match.winner.name}: {match.winner.score}
                  </strong>
                </Text>
              </PlayerName>
            )}
            {match.opponent != null && (
              <PlayerName color={match.opponent.color}>
                <Text>
                  <strong>
                    {match.opponent.name}: {match.opponent.score}
                  </strong>
                </Text>
              </PlayerName>
            )}
          </Group>
        </Stack>
      </div>
      <Group mt="lg" justify="flex-end">
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
    </Modal>
  );
}
