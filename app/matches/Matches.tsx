"use client";

import {
  ActionIcon,
  Anchor,
  Button,
  Container,
  Group,
  Modal,
  Pagination,
  Stack,
  Table,
  Tooltip,
} from "@mantine/core";
import { IconBorderAll, IconRefresh, IconTrash } from "@tabler/icons-react";
import { BingosyncColor, refreshMatch } from "./refreshMatch";
import { useState } from "react";
import ResultModal from "./ResultModal";
import deleteMatch from "./deleteMatch";
import {
  ReadonlyURLSearchParams,
  usePathname,
  useSearchParams,
} from "next/navigation";

interface Player {
  name: string;
  color: ReadonlyArray<BingosyncColor>;
  score: number;
}

export interface Match {
  id: string;
  name: string;
  dateCreated: number;
  winner: null | Player;
  opponent: null | Player;
  hasBingo: null | boolean;
  boardJson: null | string;
}

type Props = {
  matches: ReadonlyArray<Match>;
  totalPages: number;
};

const MS_IN_WEEK = 1000 * 60 * 60 * 24 * 7;

function isTooOld(dateCreated: number): boolean {
  return Date.now() - dateCreated * 1000 > MS_IN_WEEK;
}

export default function Matches({ matches, totalPages }: Props) {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const getPropsForPage = (page: number) => {
    const params = new URLSearchParams(searchParams);
    if (page === 1) {
      params.delete("page");
    } else {
      params.set("page", page.toString());
    }
    const href =
      params.size > 0 ? `${pathname}?${params.toString()}` : pathname;
    return { component: "a", href };
  };

  const page = Number(searchParams.get("page") ?? "1");

  const [viewingId, setViewingId] = useState<null | string>(null);
  const [deletingId, setDeletingId] = useState<null | string>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [refreshingIDs, setRefreshingIDs] = useState<ReadonlyArray<string>>([]);

  const viewingMatch =
    viewingId == null ? null : matches.find((match) => match.id === viewingId);
  const deletingMatch =
    deletingId == null
      ? null
      : matches.find((match) => match.id === deletingId);
  return (
    <Container my="md">
      <Stack gap={8}>
        <Table striped highlightOnHover withTableBorder>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Room</Table.Th>
              <Table.Th>Date</Table.Th>
              <Table.Th>Winner</Table.Th>
              <Table.Th>Score</Table.Th>
              <Table.Th>Opponent</Table.Th>
              <Table.Th>Score</Table.Th>
              <Table.Th style={{ width: "34px" }} />
              <Table.Th style={{ width: "34px" }} />
              <Table.Th style={{ width: "34px" }} />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {matches.map((match) => {
              return (
                <Table.Tr key={match.id}>
                  <Table.Td>
                    <Anchor
                      size="sm"
                      href={`https://www.bingosync.com/room/${match.id}`}
                      target="_blank"
                    >
                      {match.name}
                    </Anchor>
                  </Table.Td>
                  <Table.Td>
                    {new Date(match.dateCreated * 1000).toLocaleString(
                      undefined,
                      {
                        month: "numeric",
                        day: "numeric",
                        hour: "numeric",
                        minute: "numeric",
                      }
                    )}
                  </Table.Td>
                  <Table.Td>{match.winner?.name}</Table.Td>
                  <Table.Td>{match.winner?.score}</Table.Td>
                  <Table.Td>{match.opponent?.name}</Table.Td>
                  <Table.Td>{match.opponent?.score}</Table.Td>
                  <Table.Td style={{ width: "34px" }}>
                    <Tooltip label="View board">
                      <ActionIcon
                        disabled={match.boardJson == null}
                        onClick={() => setViewingId(match.id)}
                      >
                        <IconBorderAll size={16} />
                      </ActionIcon>
                    </Tooltip>
                  </Table.Td>
                  <Table.Td style={{ width: "34px" }}>
                    <Tooltip
                      label={
                        isTooOld(match.dateCreated) ? (
                          <>
                            Matches can only be refreshed within 1 week of their
                            creation
                            <br />
                            because Bingosync deletes data about the match.
                          </>
                        ) : (
                          "Refresh data from Bingosync"
                        )
                      }
                    >
                      <ActionIcon
                        disabled={
                          isTooOld(match.dateCreated) ||
                          refreshingIDs.includes(match.id)
                        }
                        color="green"
                        onClick={async () => {
                          setRefreshingIDs((prev) => [...prev, match.id]);
                          try {
                            await refreshMatch(match.id);
                          } finally {
                            setRefreshingIDs((prev) =>
                              prev.filter((id) => id !== match.id)
                            );
                          }
                        }}
                      >
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
        <Pagination
          value={page}
          total={totalPages}
          withEdges
          getItemProps={(pageNumber) => getPropsForPage(pageNumber)}
          getControlProps={(control) => {
            switch (control) {
              case "first":
                return getPropsForPage(1);
              case "last":
                return getPropsForPage(totalPages);
              case "next":
                return getPropsForPage(
                  page < totalPages ? page + 1 : totalPages
                );
              case "previous":
                return getPropsForPage(page > 1 ? page - 1 : 1);
            }
          }}
        />
      </Stack>
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
