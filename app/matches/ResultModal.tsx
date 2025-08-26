import { Button, Group, Modal } from "@mantine/core";
import { Match } from "./Matches";
import { RawSquare } from "./refreshMatch";
import { useMemo, useRef } from "react";
import Board from "../Board";
import html2canvas from "html2canvas";
import PlayerName from "./PlayerName";

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
      title={match.name}
      size="auto"
    >
      <div ref={ref}>
        <Board
          rows={board}
          onClickSquare={null}
          isHidden={false}
          setIsHidden={() => {}}
        />
        <Group justify="space-between">
          {match.p1 != null && (
            <PlayerName color={match.p1.color}>
              {match.p1.name}: {match.p1.score}
            </PlayerName>
          )}
          {match.p2 != null && (
            <PlayerName color={match.p2.color}>
              {match.p2.name}: {match.p2.score}
            </PlayerName>
          )}
        </Group>
      </div>
      <Button
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
    </Modal>
  );
}
