"use client";

import {
  ActionIcon,
  Anchor,
  Button,
  Container,
  Group,
  Menu,
  Modal,
  Pagination,
  Skeleton,
  Stack,
  Table,
  Tooltip,
} from "@mantine/core";
import {
  IconBrandYoutube,
  IconEdit,
  IconRefresh,
  IconTrash,
} from "@tabler/icons-react";
import { refreshMatch } from "./refreshMatch";
import { ReactNode, useState } from "react";
import ResultModal from "./ResultModal";
import deleteMatch from "./deleteMatch";
import { usePathname, useSearchParams } from "next/navigation";
import { BingosyncColor } from "./parseBingosyncData";
import { getVariantText, getWinType } from "./matchUtil";
import EditVodModal from "./EditVodModal";
import { getVodLink } from "./vodUtil";
import classes from "./Matches.module.css";

interface Player {
  name: string;
  color: BingosyncColor;
  score: number;
}

type Vod = {
  url: string;
  startSeconds: null | number;
};

export interface Match {
  id: string;
  name: string;
  dateCreated: number;
  variant: string;
  isCustom: boolean;
  winner: null | Player;
  opponent: null | Player;
  hasBingo: null | boolean;
  boardJson: null | string;
  changelogJson: null | string;
  isBoardVisible: boolean;
  vod: null | Vod;
}

type Props = {
  matches: ReadonlyArray<Match>;
  totalPages: number;
};

const MS_IN_DAY = 1000 * 60 * 60 * 24;

function isTooOld(dateCreated: number): boolean {
  return Date.now() - dateCreated * 1000 > MS_IN_DAY;
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
  const [editingVodId, setEditingVodId] = useState<null | string>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [refreshingIDs, setRefreshingIDs] = useState<ReadonlyArray<string>>([]);

  const viewingMatch =
    viewingId == null ? null : matches.find((match) => match.id === viewingId);
  const deletingMatch =
    deletingId == null
      ? null
      : matches.find((match) => match.id === deletingId);
  const editingVodMatch =
    editingVodId == null
      ? null
      : matches.find((match) => match.id === editingVodId);

  return (
    <Container my="md">
      <Stack gap={8}>
        <Table striped highlightOnHover withTableBorder>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Match</Table.Th>
              <Table.Th>Date</Table.Th>
              <Table.Th>Variant</Table.Th>
              <Table.Th>Winner</Table.Th>
              <Table.Th>Score</Table.Th>
              <Table.Th>Win by</Table.Th>
              <Table.Th>Opponent</Table.Th>
              <Table.Th>Score</Table.Th>
              <Table.Th style={{ width: "34px" }} />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {matches.map((match) => {
              const isRefreshing = refreshingIDs.includes(match.id);
              const dataOrSkeleton = (data: ReactNode) =>
                isRefreshing ? <Skeleton height={8} /> : data;

              const refreshItem = (
                <Menu.Item
                  disabled={isTooOld(match.dateCreated) || isRefreshing}
                  leftSection={<IconRefresh size={16} />}
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
                  Refresh data
                </Menu.Item>
              );

              const vodLink = getVodLink(match);

              return (
                <Table.Tr key={match.id}>
                  <Table.Td>
                    {vodLink !== "" && (
                      <Tooltip label="Watch VOD">
                        <ActionIcon
                          className={classes.vodButton}
                          size="sm"
                          component="a"
                          href={vodLink}
                          target="_blank"
                          color="red"
                        >
                          <IconBrandYoutube size={16} />
                        </ActionIcon>
                      </Tooltip>
                    )}
                    <Tooltip
                      label={
                        match.boardJson == null ? (
                          "You must Refresh data from Bingosync before viewing the board!"
                        ) : isRefreshing ? (
                          "Refreshing..."
                        ) : match.isBoardVisible ? (
                          <>
                            View board and changelog.
                            <br />
                            If a VOD is linked, the changelog also has
                            <br />
                            timestamped links to each goal completion.
                          </>
                        ) : (
                          <>
                            No goals have been claimed yet! The board can be
                            <br />
                            viewed after at least one goal has been claimed
                            <br />
                            and data has been refreshed.
                          </>
                        )
                      }
                    >
                      {match.boardJson == null ||
                      isRefreshing ||
                      !match.isBoardVisible ? (
                        <span>{match.name}</span>
                      ) : (
                        <Anchor
                          size="sm"
                          onClick={() => setViewingId(match.id)}
                        >
                          {match.name}
                        </Anchor>
                      )}
                    </Tooltip>
                  </Table.Td>
                  <Table.Td suppressHydrationWarning={true}>
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
                  <Table.Td>{getVariantText(match)}</Table.Td>
                  <Table.Td>{dataOrSkeleton(match.winner?.name)}</Table.Td>
                  <Table.Td>{dataOrSkeleton(match.winner?.score)}</Table.Td>
                  <Table.Td>{dataOrSkeleton(getWinType(match))}</Table.Td>
                  <Table.Td>{dataOrSkeleton(match.opponent?.name)}</Table.Td>
                  <Table.Td>{dataOrSkeleton(match.opponent?.score)}</Table.Td>
                  <Table.Td>
                    <Menu shadow="md" width="auto">
                      <Menu.Target>
                        <Tooltip label="Refresh/Edit">
                          <ActionIcon color="green">
                            <IconEdit size={16} />
                          </ActionIcon>
                        </Tooltip>
                      </Menu.Target>
                      <Menu.Dropdown>
                        {isTooOld(match.dateCreated) ? (
                          <Tooltip
                            label={
                              <>
                                Matches can only be refreshed within 1 day of
                                their creation
                                <br />
                                because Bingosync deletes data about the match.
                              </>
                            }
                          >
                            {refreshItem}
                          </Tooltip>
                        ) : (
                          refreshItem
                        )}
                        <Menu.Item
                          leftSection={<IconBrandYoutube size={16} />}
                          onClick={() => setEditingVodId(match.id)}
                        >
                          {vodLink !== "" ? "Edit" : "Add"} VOD Link
                        </Menu.Item>
                        <Menu.Item
                          leftSection={<IconTrash size={16} />}
                          onClick={() => setDeletingId(match.id)}
                        >
                          Delete match
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
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
      {editingVodMatch != null && (
        <EditVodModal
          match={editingVodMatch}
          onClose={() => setEditingVodId(null)}
        />
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
