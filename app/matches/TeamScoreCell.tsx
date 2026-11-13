import { Group, Text, Tooltip } from "@mantine/core";
import BingoIcon from "./BingoIcon";
import classes from "./MatchRow.module.css";
import { getColorHex } from "../color";
import { MatchTeamWithResult } from "./useTeamsWithResults";

type Props = {
  team: MatchTeamWithResult;
  size: "md" | "lg";
};

export default function TeamScoreCell({ team, size }: Props) {
  const iconColor = getColorHex(team.color);
  return (
    <Group gap={6} wrap="nowrap" justify="flex-end" align="center">
      <Text lh={1} size={size} c={team.winType != null ? undefined : "dimmed"}>
        {team.winType != null ? <strong>{team.score}</strong> : team.score}
      </Text>
      <span className={classes.iconSlot}>
        {team.winType != null && (
          <Tooltip label={team.winType} withArrow>
            <span className={classes.winIcon}>
              <BingoIcon
                size={size === "md" ? 16 : 20}
                color={iconColor}
                winType={team.winType}
              />
            </span>
          </Tooltip>
        )}
      </span>
    </Group>
  );
}
