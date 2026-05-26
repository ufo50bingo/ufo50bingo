import { Modal } from "@mantine/core";
import { Match } from "./Matches";
import MatchView from "./MatchView";

type Props = {
  isMobile: boolean;
  match: Match;
  matchesUrl: string | null;
  onClose: () => void;
};

export default function ResultModal({ isMobile, match, matchesUrl, onClose }: Props) {
  return (
    <Modal
      fullScreen={isMobile}
      centered={true}
      onClose={onClose}
      opened={true}
      size="auto"
      withCloseButton={isMobile}
    >
      <MatchView match={match} matchesUrl={matchesUrl} />
    </Modal>
  );
}
