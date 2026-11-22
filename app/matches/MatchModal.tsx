import { Modal } from "@mantine/core";
import { FullParsedGame } from "../fetchFeed";

type Props = {
  isMobile: boolean;
  game: FullParsedGame;
  onClose: () => unknown;
};

export default function MatchModal({ game, onClose, isMobile }: Props) {
  return (
    <Modal
      opened={true}
      onClose={onClose}
      fullScreen={isMobile}
      centered={true}
      size="auto"
      withCloseButton={isMobile}
    >
      <div>{game.game.name}</div>
    </Modal>
  );
}
