import { Modal } from "@mantine/core";
import { Match } from "./Matches";
import { RawSquare } from "./refreshMatch";
import { useMemo } from "react";
import Board from "../Board";

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
  return (
    <Modal
      centered={true}
      onClose={onClose}
      opened={true}
      title={match.name}
      size="auto"
    >
      <Board
        rows={board}
        onClickSquare={null}
        isHidden={false}
        setIsHidden={() => {}}
      />
    </Modal>
  );
}
