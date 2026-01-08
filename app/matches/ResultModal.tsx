"use client";

import { Modal } from "@mantine/core";
import { Match } from "./Matches";
import MatchView from "./MatchView";
import { useRouter } from "next/navigation";

type Props = {
  isMobile: boolean;
  match: Match;
};

export default function ResultModal({ isMobile, match }: Props) {
  const router = useRouter();
  return (
    <Modal
      fullScreen={isMobile}
      centered={true}
      onClose={() => router.back()}
      opened={true}
      size="auto"
      withCloseButton={isMobile}
    >
      <MatchView match={match} />
    </Modal>
  );
}
