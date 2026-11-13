"use client";

import {
  ActionIcon,
  Anchor,
  Button,
  Group,
  Menu,
  Modal,
  Stack,
  Text,
  Tooltip,
} from "@mantine/core";
import {
  IconBrandTwitch,
  IconBrandYoutube,
  IconEye,
  IconMicrophone,
  IconPencil,
  IconTournament,
  IconTrash,
} from "@tabler/icons-react";
import { Fragment, useMemo, useState } from "react";
import classes from "./MatchRow.module.css";
import { FullParsedGame } from "../fetchFeed";
import useMembers from "../room/[id]/common/useMembers";
import { displayWeek } from "./week";
import { displayTier } from "./tier";
import { getVariantText } from "./matchUtil";
import { getHost } from "./vodUtil";
import formatMatchDate from "./formatMatchDate";
import { db } from "../db";
import { useAppContext } from "../AppContextProvider";
import useSession from "../session/useSession";
import { authClient } from "../authClient";
import EditLeagueModal from "./EditLeagueModal";
import EditVodModal from "./EditVodModal";
import { LEAGUE_SEASON } from "../createboard/leagueConstants";
import MatchModal from "./MatchModal";
import useTeams from "./useTeams";
import TeamPlayers from "./TeamPlayers";
import TeamScoreCell from "./TeamScoreCell";
import getFeedWithoutMistakes from "../match/[id]/getFeedWithoutMistakes";
import useTeamsWithResults from "./useTeamsWithResults";

const ICON_SIZE = 16;

type Props = {
  game: FullParsedGame;
  isMobile: boolean;
};

export function MatchRow({ game, isMobile }: Props) {
  const { revealedMatchIDs } = useAppContext();
  // TODO: Read from context
  const hideByDefault = true;
  const oldSession = useSession();
  const { data: session } = authClient.useSession();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeletionProessing, setIsDeletionProcessing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingLeague, setIsEditingLeague] = useState(false);

  const { game: info, feed } = game;

  const { players, casters } = useMembers(feed);
  const teamsMap = useTeams(players);

  const boardStateParams = useMemo(
    () => ({
      rows: info.rows,
      cols: info.cols,
      isLockout: info.isLockout,
    }),
    [info.cols, info.isLockout, info.rows],
  );

  const feedWithoutMistakes = useMemo(
    () => getFeedWithoutMistakes(feed, boardStateParams),
    [boardStateParams, feed],
  );

  const teamsWithResults = useTeamsWithResults(
    teamsMap,
    feedWithoutMistakes,
    boardStateParams,
  );

  const hasWinner =
    teamsWithResults.length > 0 && teamsWithResults[0].winType != null;
  const isVisible =
    !hideByDefault || revealedMatchIDs?.has(String(info.id)) === true;
  const name = info.name ?? `Match #${info.id}`;

  let isTwitch = false;
  const vod = info.vod;
  if (vod != null) {
    try {
      const url = new URL(vod.url);
      const host = getHost(url);
      isTwitch = host === "twitch";
    } catch {}
  }

  const userIdStr = session?.user.id;
  const userId = userIdStr != null ? Number(userIdStr) : null;
  const isCreatorOrAdmin =
    (userId != null && userId === info.creatorId) || oldSession?.admin === true;
  const canEditLeague =
    isCreatorOrAdmin &&
    info.variant == "Standard" &&
    info.isCustom === false &&
    LEAGUE_SEASON != null;

  const editLeagueItem = (
    <Menu.Item
      disabled={!canEditLeague}
      leftSection={<IconTournament size={16} />}
      onClick={() => setIsEditingLeague(true)}
    >
      Edit League Info
    </Menu.Item>
  );

  const deleteItem = (
    <Menu.Item
      disabled={!isCreatorOrAdmin}
      leftSection={<IconTrash size={16} />}
      onClick={() => setIsDeleting(true)}
    >
      Delete match
    </Menu.Item>
  );
  return (
    <>
      <div className={classes.row}>
        <div className={classes.vod}>
          {vod !== null && (
            <Tooltip label="Watch VOD">
              <ActionIcon
                className={classes.vodButton}
                size="sm"
                component="a"
                href={vod.url}
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
        </div>

        <Stack gap={2} miw={0}>
          <Text fw={500} size="sm">
            <Anchor
              onClick={() => {
                history.pushState({}, "", `/match/${game.game.id}`);
                setIsModalOpen(true);
              }}
            >
              {name}
            </Anchor>
          </Text>
          <Text size="xs" c="dimmed">
            {getVariantText(game.game)}
          </Text>
          <Text size="xs" c="dimmed" suppressHydrationWarning>
            {formatMatchDate(info.dateCreated)}
          </Text>
        </Stack>

        <div className={classes.league}>
          {info.leagueGame && (
            <Stack gap={0}>
              <Text size="sm">
                <strong>
                  Season {info.leagueGame.season} · Tier{" "}
                  {displayTier(info.leagueGame.tier)}
                </strong>
              </Text>
              <Text size="xs" c="dimmed">
                {displayWeek(info.leagueGame.week)}
              </Text>
            </Stack>
          )}
        </div>

        <div className={classes.teams}>
          {teamsWithResults.map((team, idx) => {
            return (
              <Fragment key={team.color}>
                <TeamPlayers
                  team={team}
                  isWinner={team.winType != null}
                  isWinnerShown={isVisible && hasWinner}
                  size="md"
                />
                {isVisible ? (
                  <TeamScoreCell team={team} size="md" />
                ) : (
                  idx === 0 && (
                    <Tooltip label="Show result" withArrow>
                      <ActionIcon
                        className={classes.reveal}
                        style={{
                          gridRow: `1 / span ${teamsWithResults.length}`,
                        }}
                        variant="light"
                        w="auto"
                        h="auto"
                        onClick={async () =>
                          await db.revealedMatches.add({ id: String(info.id) })
                        }
                        aria-label={`Show result for ${name}`}
                      >
                        <IconEye size={ICON_SIZE} />
                      </ActionIcon>
                    </Tooltip>
                  )
                )}
              </Fragment>
            );
          })}

          {casters.length > 0 && (
            <Group
              gap={5}
              wrap="nowrap"
              align="flex-start"
              c="dimmed"
              className={classes.casters}
            >
              <IconMicrophone
                size={14}
                aria-label="Casters"
                style={{ flexShrink: 0, marginTop: 2 }}
              />
              <Text size="xs" c="dimmed" className={classes.name}>
                {casters.map((c) => c.name).join(", ")}
              </Text>
            </Group>
          )}
        </div>

        <div className={classes.edit}>
          <Menu shadow="md" width="auto">
            <Menu.Target>
              <ActionIcon
                variant="subtle"
                color="gray"
                size="md"
                aria-label={`Edit ${name}`}
              >
                <IconPencil size={ICON_SIZE} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                leftSection={<IconBrandYoutube size={16} />}
                onClick={() => setIsEditing(true)}
              >
                {vod?.url != null && vod?.url !== "" ? "Edit" : "Add"} VOD Link
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
        </div>
      </div>
      {isEditing && (
        <EditVodModal
          matchesUrl={null}
          isMobile={isMobile}
          match={game}
          onClose={() => setIsEditing(false)}
        />
      )}
      {isEditingLeague && (
        <EditLeagueModal
          matchesUrl={null}
          isMobile={isMobile}
          match={game}
          onClose={() => setIsEditingLeague(false)}
        />
      )}
      {isDeleting && (
        <Modal
          fullScreen={isMobile}
          centered={true}
          onClose={() => setIsDeleting(false)}
          opened={true}
          title="Confirm Deletion"
        >
          Are you sure you want to delete this match?
          <br />
          <strong>{game.game.name}</strong>
          <br />
          Deletion is not reversible.
          <Group mt="lg" justify="flex-end">
            <Button onClick={() => setIsDeleting(false)}>Cancel</Button>
            <Button
              disabled={isDeletionProessing}
              onClick={async () => {
                try {
                  setIsDeletionProcessing(true);
                  // TODO: Fix up delete match
                  // await deleteMatch(info.id);
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
      {isModalOpen && (
        <MatchModal
          game={game}
          isMobile={isMobile}
          onClose={() => {
            setIsModalOpen(false);
            history.back();
          }}
        />
      )}
    </>
  );
}
