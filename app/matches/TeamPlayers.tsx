import { Avatar, Group, Text } from "@mantine/core";
import { MatchTeam } from "./useTeams";
import classes from "./MatchRow.module.css";
import { getColorHex } from "../color";
import { PlayerMember } from "../room/[id]/common/useMembers";

type Props = {
  team: MatchTeam;
  isWinnerShown: boolean;
  isWinner: boolean;
  size: "md" | "lg";
};

export default function TeamPlayers({
  team,
  isWinnerShown,
  isWinner,
  size,
}: Props) {
  const players: ReadonlyArray<PlayerMember> =
    team.players.length > 0
      ? team.players
      : // if team is empty, add a fake player
        [
          {
            name: "No players",
            userId: 0,
            image: null,
            color: team.color,
            isInvite: false,
          },
        ];
  return (
    <Group gap={8} wrap="nowrap" align="stretch" miw={0}>
      <span
        className={classes.teamBar}
        style={{
          background: getColorHex(team.color),
        }}
        role="img"
        aria-label={`${team.color} team`}
      />
      <Group wrap="wrap" miw={0} style={{ columnGap: 12, rowGap: 4 }}>
        {players.map((p) => (
          <Group key={p.userId} gap={6} wrap="nowrap" miw={0}>
            <Avatar
              name={p.name}
              src={p.image}
              color={"initials"}
              size={size === "md" ? 20 : 24}
              radius="xl"
              style={{ flexShrink: 0 }}
            />
            <Text
              size={size === "md" ? "sm" : "md"}
              c={!isWinner && isWinnerShown ? "dimmed" : undefined}
              className={classes.name}
            >
              {isWinner && isWinnerShown ? <strong>{p.name}</strong> : p.name}
            </Text>
          </Group>
        ))}
      </Group>
    </Group>
  );
}
