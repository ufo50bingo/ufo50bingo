"use client";

import { ActionIcon, Container, Table, Tooltip } from "@mantine/core";
import { IconRefresh } from "@tabler/icons-react";
import { refreshMatch } from "./refreshMatch";

type BingoColor = "red" | "blue";

interface Player {
  name: string;
  color: BingoColor;
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
}

type Props = {
  matches: ReadonlyArray<Match>;
};

export default function Matches({ matches }: Props) {
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
    </Container>
  );
}
