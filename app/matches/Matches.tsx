"use client";

import { ActionIcon, Button, Container, Table, Tooltip } from "@mantine/core";
import { IconRefresh } from "@tabler/icons-react";
import { BingosyncColor, refreshMatch } from "./refreshMatch";
import { useState } from "react";
import ResultModal from "./ResultModal";

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
  const viewingMatch = matches.find((match) => match.id === viewingId);
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
            <Table.Th />
            <Table.Th />
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
                <Table.Td>
                  <Button
                    disabled={match.boardJson == null}
                    onClick={() => setViewingId(match.id)}
                  >
                    View Board
                  </Button>
                </Table.Td>
                <Table.Td>
                  <Tooltip label="Refresh data from Bingosync">
                    <ActionIcon onClick={() => refreshMatch(match.id)}>
                      <IconRefresh size={16} />
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
    </Container>
  );
}
