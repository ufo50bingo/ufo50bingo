"use client";

import {
  ActionIcon,
  Button,
  Container,
  Group,
  Modal,
  Table,
  Tooltip,
} from "@mantine/core";
import { IconRefresh, IconTrash } from "@tabler/icons-react";
import { BingosyncColor, refreshMatch } from "./refreshMatch";
import { useState } from "react";
import ResultModal from "./ResultModal";
import deleteMatch from "./deleteMatch";

interface Player {
  name: string;
  color: ReadonlyArray<BingosyncColor>;
  score: number;
}

export interface Match {
  id: string;
  name: string;
  dateCreated: number;
  p1: null | Player;
  p2: null | Player;
  hasBingo: null | boolean;
  winner: null | "p1" | "p2";
  boardJson: null | string;
}

type Props = {
  matches: ReadonlyArray<Match>;
};

export default function Matches({ matches }: Props) {
  const [viewingId, setViewingId] = useState<null | string>(null);
  const [deletingId, setDeletingId] = useState<null | string>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const viewingMatch =
    viewingId == null ? null : matches.find((match) => match.id === viewingId);
  const deletingMatch =
    deletingId == null
      ? null
      : matches.find((match) => match.id === deletingId);
  return (
    <Container my="md">
      <Table striped highlightOnHover withTableBorder>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Room</Table.Th>
            <Table.Th>P1</Table.Th>
            <Table.Th>P1 Score</Table.Th>
            <Table.Th>P2</Table.Th>
            <Table.Th>P2 Score</Table.Th>
            <Table.Th style={{ width: "80px" }} />
            <Table.Th style={{ width: "34px" }} />
            <Table.Th style={{ width: "34px" }} />
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {matches.map((match) => {
            return (
              <Table.Tr key={match.id}>
                <Table.Td>{match.name}</Table.Td>
                <Table.Td>{match.p1?.name}</Table.Td>
                <Table.Td>{match.p1?.score}</Table.Td>
                <Table.Td>{match.p2?.name}</Table.Td>
                <Table.Td>{match.p2?.score}</Table.Td>
                <Table.Td style={{ width: "80px" }}>
                  <Button
                    disabled={match.boardJson == null}
                    onClick={() => setViewingId(match.id)}
                  >
                    View Board
                  </Button>
                </Table.Td>
                <Table.Td style={{ width: "34px" }}>
                  <Tooltip label="Refresh data from Bingosync">
                    <ActionIcon onClick={() => refreshMatch(match.id)}>
                      <IconRefresh size={16} />
                    </ActionIcon>
                  </Tooltip>
                </Table.Td>
                <Table.Td style={{ width: "34px" }}>
                  <Tooltip label="Delete match">
                    <ActionIcon
                      color="red"
                      onClick={() => setDeletingId(match.id)}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Tooltip>
                </Table.Td>
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>
      {viewingMatch != null && (
        <ResultModal match={viewingMatch} onClose={() => setViewingId(null)} />
      )}
      {deletingMatch != null && (
        <Modal
          centered={true}
          onClose={() => setDeletingId(null)}
          opened={true}
          title="Confirm Deletion"
        >
          Are you sure you want to delete this match?
          <br />
          <strong>{deletingMatch.name}</strong>
          <br />
          Deletion is not reversible.
          <Group mt="lg" justify="flex-end">
            <Button onClick={() => setDeletingId(null)}>Cancel</Button>
            <Button
              disabled={isDeleting}
              onClick={async () => {
                try {
                  setIsDeleting(true);
                  await deleteMatch(deletingMatch.id);
                  setDeletingId(null);
                } finally {
                  setIsDeleting(false);
                }
              }}
              color="red"
            >
              Delete
            </Button>
          </Group>
        </Modal>
      )}
    </Container>
  );
}
