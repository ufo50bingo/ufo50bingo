import { Avatar, Group, Text } from "@mantine/core";
import { MatchTeam } from "./useTeams";
import classes from "./MatchRow.module.css";
import { getColorHex } from "../color";

type Props = {
  team: MatchTeam;
  isVisible: boolean;
  isWinner: boolean;
  size: "md" | "lg";
};

export default function TeamPlayers({
  team,
  isVisible,
  isWinner,
  size,
}: Props) {
  return (
    <Group gap={8} wrap="nowrap" align="stretch" miw={0}>
      <span
        className={classes.teamBar}
        style={{ background: getColorHex(team.color) }}
        role="img"
        aria-label={`${team.color} team`}
      />
      <Group wrap="wrap" miw={0} style={{ columnGap: 12, rowGap: 4 }}>
        {team.players.map((p) => (
          <Group key={p.userId} gap={6} wrap="nowrap" miw={0}>
            <Avatar
              name={p.name}
              src={p.image}
              color="initials"
              size={size === "md" ? 20 : 24}
              radius="xl"
              style={{ flexShrink: 0 }}
            />
            <Text
              size={size === "md" ? "sm" : "md"}
              c={!isWinner && isVisible ? "dimmed" : undefined}
              className={classes.name}
            >
              {isWinner && isVisible ? <strong>{p.name}</strong> : p.name}
            </Text>
          </Group>
        ))}
      </Group>
    </Group>
  );
}
