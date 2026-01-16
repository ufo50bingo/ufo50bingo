"use client";

import {
  ActionIcon,
  Alert,
  Anchor,
  Autocomplete,
  Button,
  Group,
  Menu,
  Modal,
  Pagination,
  Select,
  Skeleton,
  Stack,
  Switch,
  Table,
  Text,
  Tooltip,
} from "@mantine/core";
import {
  IconBrandTwitch,
  IconBrandYoutube,
  IconEdit,
  IconFilter,
  IconRefresh,
  IconTournament,
  IconTrash,
} from "@tabler/icons-react";
import { refreshMatch } from "./refreshMatch";
import { ReactNode, useState } from "react";
import ResultModal from "./ResultModal";
import deleteMatch from "./deleteMatch";
import {
  ReadonlyURLSearchParams,
  usePathname,
  useSearchParams,
} from "next/navigation";
import { BingosyncColor } from "./parseBingosyncData";
import { getVariantText, getWinType } from "./matchUtil";
import EditVodModal from "./EditVodModal";
import { getHost, getVodLink } from "./vodUtil";
import classes from "./Matches.module.css";

import { useAppContext } from "../AppContextProvider";
import { LeagueInfo } from "../createboard/createMatch";
import Link from "next/link";
import {
  ALL_TIERS,
  LEAGUE_SEASON,
  PLAYERS_FOR_FILTER,
  WEEKS,
} from "../createboard/leagueConstants";
import { useMediaQuery } from "@mantine/hooks";
import { db } from "../db";
import EditLeagueModal from "./EditLeagueModal";

const ADMIN_FILTERS = [
  {
    value: "leagueMissingVods",
    label: "League Missing VODs",
  },
  {
    value: "missingTimestamps",
    label: "Missing Timestamps",
  },
] as const;
export type AdminFilter = (typeof ADMIN_FILTERS)[number]["value"];

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
  analysisSeconds: number;
  leagueInfo: null | LeagueInfo;
  creatorID: null | string;
}

type Props = {
  matches: ReadonlyArray<Match>;
  totalPages: number;
};

const MS_IN_DAY = 1000 * 60 * 60 * 24;

export function isTooOld(dateCreated: number): boolean {
  return Date.now() - dateCreated * 1000 > MS_IN_DAY;
}

const SEASONS = ["Season 2", "Season 1", "Non-League"] as const;
type Season = (typeof SEASONS)[number];

function getHrefFromParams(pathname: string, params: URLSearchParams): string {
  return params.size > 0 ? `${pathname}?${params.toString()}` : pathname;
}

function getSeasonStr(
  season: null | undefined | Season
): null | undefined | string {
  switch (season) {
    case null:
    case undefined:
      return null;
    case "Non-League":
      return "0";
    case "Season 2":
      return "2";
    case "Season 1":
      return "1";
  }
}

function getFilterHref(
  pathname: string,
  curParams: ReadonlyURLSearchParams,
  season: null | undefined | Season,
  tier: null | undefined | string,
  week: null | undefined | string,
  player: undefined | string,
  admin: null | undefined | string
): string {
  const params = new URLSearchParams(curParams);

  const seasonStr = getSeasonStr(season);
  if (seasonStr == null) {
    params.delete("season");
  } else {
    params.set("season", seasonStr);
  }

  if (tier == null || tier === "") {
    params.delete("tier");
  } else {
    params.set("tier", tier);
  }

  if (week == null || week === "") {
    params.delete("week");
  } else {
    params.set("week", week);
  }

  if (player == null || player == "") {
    params.delete("player");
  } else {
    params.set("player", player);
  }

  if (admin == null || admin == "") {
    params.delete("admin");
  } else {
    params.set("admin", admin);
  }

  params.delete("page");
  return getHrefFromParams(pathname, params);
}

function getSeasonFromParams(params: ReadonlyURLSearchParams): null | Season {
  const season = params.get("season");
  switch (season) {
    case "2":
      return "Season 2";
    case "0":
      return "Non-League";
    default:
      return null;
  }
}

function getPlayerFromParams(
  params: ReadonlyURLSearchParams
): undefined | string {
  const player = params.get("player");
  return player == null || player === "" ? undefined : player;
}

function getTierFromParams(
  params: ReadonlyURLSearchParams
): undefined | string {
  const tier = params.get("tier");
  return tier == null || tier === "" ? undefined : tier;
}

function getWeekFromParams(
  params: ReadonlyURLSearchParams
): undefined | string {
  const week = params.get("week");
  return week == null || week === "" ? undefined : week;
}

function getAdminFromParams(
  params: ReadonlyURLSearchParams
): undefined | string {
  const admin = params.get("admin");
  return admin == null || admin === "" ? undefined : admin;
}

export default function Matches({ matches, totalPages }: Props) {
  const {
    isMounted,
    createdMatchIDs,
    hideByDefault,
    setHideByDefault,
    isAdmin,
    revealedMatchIDs,
  } = useAppContext();

  const searchParams = useSearchParams();
  const pathname = usePathname();

  const getPropsForPage = (page: number) => {
    const params = new URLSearchParams(searchParams);
    if (page === 1) {
      params.delete("page");
    } else {
      params.set("page", page.toString());
    }
    return { component: "a", href: getHrefFromParams(pathname, params) };
  };

  const page = Number(searchParams.get("page") ?? "1");

  const [viewingId, setViewingId] = useState<null | string>(null);
  const [deletingId, setDeletingId] = useState<null | string>(null);
  const [editingVodId, setEditingVodId] = useState<null | string>(null);
  const [editingLeagueId, setEditingLeagueId] = useState<null | string>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [refreshingIDs, setRefreshingIDs] = useState<ReadonlyArray<string>>([]);
  const [season, setSeason] = useState<null | undefined | Season>(
    getSeasonFromParams(searchParams)
  );
  const [tier, setTier] = useState<null | undefined | string>(
    getTierFromParams(searchParams)
  );
  const [week, setWeek] = useState<null | undefined | string>(
    getWeekFromParams(searchParams)
  );
  const [player, setPlayer] = useState<undefined | string>(
    getPlayerFromParams(searchParams)
  );
  const [admin, setAdmin] = useState<null | undefined | string>(
    getAdminFromParams(searchParams)
  );

  const isDirty =
    (getSeasonStr(season) ?? null) !== (searchParams.get("season") ?? null) ||
    (tier == null || tier === "" ? null : tier) !==
      (searchParams.get("tier") ?? null) ||
    (week == null || week === "" ? null : week) !==
      (searchParams.get("week") ?? null) ||
    (player == null || player === "" ? null : player) !==
      (searchParams.get("player") ?? null) ||
    (admin == null || admin === "" ? null : admin) !==
      (searchParams.get("admin") ?? null);

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
  const editingLeagueMatch =
    editingLeagueId == null
      ? null
      : matches.find((match) => match.id === editingLeagueId);

  // 525px is the width of the board, which is also the default width of the modal
  const isMobile = useMediaQuery("(max-width: 525px)");

  if (!isMounted || (hideByDefault && revealedMatchIDs == null)) {
    return null;
  }
  return (
    <>
      <Stack gap={8}>
        <Alert variant="light">
          <Text size="sm">
            When you finish your match, please use the{" "}
            <ActionIcon color="green" onClick={() => {}}>
              <IconEdit size={16} />
            </ActionIcon>{" "}
            icon to Refresh data from Bingosync and add a VOD Link, if
            available. Matches with VOD links are automatically synced to{" "}
            <Anchor
              href="https://docs.google.com/spreadsheets/d/1bW8zjoR2bpr74w-dA4HHt04SqvGg1aj8FJeOs3EqdNE/edit?gid=0#gid=0"
              target="_blank"
            >
              UFO 50 Bingo VOD Links and Stats
            </Anchor>
            !
          </Text>
        </Alert>
        <Group justify="space-between">
          <Group>
            <Select
              style={{ width: "150px" }}
              clearable={true}
              data={SEASONS}
              value={season}
              onChange={(newSeason) =>
                setSeason(newSeason as unknown as null | Season)
              }
              placeholder="Filter by season"
            />
            <Select
              style={{ width: "150px" }}
              clearable={true}
              data={ALL_TIERS}
              value={tier}
              onChange={(newTier) => setTier(newTier)}
              placeholder="Filter by tier"
            />
            <Select
              style={{ width: "150px" }}
              clearable={true}
              data={WEEKS}
              value={week}
              onChange={(newWeek) => setWeek(newWeek)}
              placeholder="Filter by week"
            />
            <Autocomplete
              clearable={true}
              data={PLAYERS_FOR_FILTER}
              value={player}
              onChange={setPlayer}
              placeholder="Filter by player"
              spellCheck={false}
            />
            {isAdmin && (
              <Select
                style={{ width: "150px" }}
                data={ADMIN_FILTERS}
                clearable={true}
                value={admin}
                onChange={setAdmin}
                placeholder="Admin filters"
              />
            )}
            <Button
              leftSection={<IconFilter size={16} />}
              component={Link}
              disabled={!isDirty}
              href={getFilterHref(
                pathname,
                searchParams,
                season,
                tier,
                week,
                player,
                admin
              )}
            >
              Apply Filters
            </Button>
          </Group>
          <Switch
            checked={hideByDefault}
            label="Hide match details by default"
            onChange={(event) => setHideByDefault(event.currentTarget.checked)}
          />
        </Group>
        <div style={{ overflowX: "auto" }}>
          <Table striped highlightOnHover withTableBorder>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Match</Table.Th>
                <Table.Th>Season</Table.Th>
                <Table.Th>Tier</Table.Th>
                <Table.Th>Week</Table.Th>
                <Table.Th>Date</Table.Th>
                <Table.Th>Variant</Table.Th>
                <Table.Th>Winner</Table.Th>
                <Table.Th>Score</Table.Th>
                <Table.Th>Opponent</Table.Th>
                <Table.Th>Score</Table.Th>
                <Table.Th>Win by</Table.Th>
                <Table.Th style={{ width: "34px" }} />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {matches.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={12}>
                    No matches meet your filter criteria!
                  </Table.Td>
                </Table.Tr>
              ) : (
                matches.map((match) => {
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

                  const isCreatorOrAdmin =
                    createdMatchIDs.has(match.id) || isAdmin;

                  const canEditLeague =
                    isCreatorOrAdmin &&
                    match.variant == "Standard" &&
                    match.isCustom === false &&
                    LEAGUE_SEASON != null;

                  const deleteItem = (
                    <Menu.Item
                      disabled={!isCreatorOrAdmin}
                      leftSection={<IconTrash size={16} />}
                      onClick={() => setDeletingId(match.id)}
                    >
                      Delete match
                    </Menu.Item>
                  );

                  const editLeagueItem = (
                    <Menu.Item
                      disabled={!canEditLeague}
                      leftSection={<IconTournament size={16} />}
                      onClick={() => setEditingLeagueId(match.id)}
                    >
                      Edit League Info
                    </Menu.Item>
                  );

                  let isTwitch = false;
                  const vod = match.vod;
                  if (vod != null) {
                    const url = new URL(vod.url);
                    const host = getHost(url);
                    isTwitch = host === "twitch";
                  }
                  // rewind 90 seconds to get the lead-up to the reveal
                  const vodLink = getVodLink(match, -90);

                  const isRevealed =
                    !hideByDefault || revealedMatchIDs?.has(match.id);

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
                              color={isTwitch ? "violet" : "red"}
                            >
                              {isTwitch ? (
                                <IconBrandTwitch size={16} />
                              ) : (
                                <IconBrandYoutube size={16} />
                              )}
                            </ActionIcon>
                          </Tooltip>
                        )}
                        <Tooltip
                          label={
                            <>
                              View board and changelog.
                              <br />
                              If a VOD is linked, the changelog also has
                              <br />
                              timestamped links to each goal completion.
                            </>
                          }
                        >
                          {isRefreshing ? (
                            <span>{match.name}</span>
                          ) : (
                            <Anchor
                              size="sm"
                              onClick={() => {
                                setViewingId(match.id);
                              }}
                            >
                              {match.name}
                            </Anchor>
                          )}
                        </Tooltip>
                      </Table.Td>
                      <Table.Td>{match.leagueInfo?.season}</Table.Td>
                      <Table.Td>{match.leagueInfo?.tier}</Table.Td>
                      <Table.Td>{match.leagueInfo?.week}</Table.Td>
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
                      <Table.Td>{getVariantText(match)}</Table.Td>
                      {isRevealed ? (
                        <>
                          <Table.Td>
                            {dataOrSkeleton(match.winner?.name)}
                          </Table.Td>
                          <Table.Td>
                            {dataOrSkeleton(match.winner?.score)}
                          </Table.Td>
                          <Table.Td>
                            {dataOrSkeleton(match.opponent?.name)}
                          </Table.Td>
                          <Table.Td>
                            {dataOrSkeleton(match.opponent?.score)}
                          </Table.Td>
                          <Table.Td>
                            {dataOrSkeleton(getWinType(match))}
                          </Table.Td>
                        </>
                      ) : (
                        <Table.Td colSpan={5} style={{ textAlign: "center" }}>
                          <Anchor
                            onClick={async () =>
                              await db.revealedMatches.add({ id: match.id })
                            }
                            size="sm"
                          >
                            Click to reveal match details
                          </Anchor>
                        </Table.Td>
                      )}
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
                                    Matches can only be refreshed within 1 day
                                    of their creation
                                    <br />
                                    because Bingosync deletes data about the
                                    match.
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
                            {!canEditLeague ? (
                              <Tooltip label="You can only edit Standard matches you created.">
                                {editLeagueItem}
                              </Tooltip>
                            ) : (
                              editLeagueItem
                            )}
                            {!isCreatorOrAdmin ? (
                              <Tooltip label="You can only delete matches you created.">
                                {deleteItem}
                              </Tooltip>
                            ) : (
                              deleteItem
                            )}
                          </Menu.Dropdown>
                        </Menu>
                      </Table.Td>
                    </Table.Tr>
                  );
                })
              )}
            </Table.Tbody>
          </Table>
        </div>
        {matches.length > 0 && (
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
        )}
      </Stack>
      {viewingMatch != null && (
        <ResultModal
          isMobile={isMobile}
          match={viewingMatch}
          onClose={() => {
            setViewingId(null);
          }}
        />
      )}
      {editingVodMatch != null && (
        <EditVodModal
          isMobile={isMobile}
          match={editingVodMatch}
          onClose={() => setEditingVodId(null)}
        />
      )}
      {editingLeagueMatch != null && (
        <EditLeagueModal
          isMobile={isMobile}
          match={editingLeagueMatch}
          onClose={() => setEditingLeagueId(null)}
        />
      )}
      {deletingMatch != null && (
        <Modal
          fullScreen={isMobile}
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
    </>
  );
}
