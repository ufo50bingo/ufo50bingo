import { Group, Text, Tooltip } from "@mantine/core";
import { IconProgress } from "@tabler/icons-react";
import BingoIcon from "./BingoIcon";
import classes from "./MatchRow.module.css";
import { getColorHex } from "../color";
import { MatchTeamWithResult } from "./useTeamsWithResults";

type Props = {
  team: MatchTeamWithResult;
  size: "md" | "lg";
  isWinnerShown?: boolean;
  isInProgress?: boolean;
};

export default function TeamScoreCell({
  team,
  size,
  isWinnerShown = true,
  isInProgress = false,
}: Props) {
  const iconColor = getColorHex(team.color);
  return (
    <Group gap={6} wrap="nowrap" justify="flex-end" align="center">
      <Text
        lh={1}
        size={size}
        c={isWinnerShown && team.winType != null ? undefined : "dimmed"}
      >
        {isWinnerShown && team.winType != null ? (
          <strong>{team.score}</strong>
        ) : (
          team.score
        )}
      </Text>
      <span
        className={`${classes.iconSlot} ${isInProgress ? classes.inProgressSlot : ""}`}
      >
        {isInProgress && (
          <Tooltip label="In progress" withArrow={true}>
            <IconProgress size={size === "md" ? 16 : 20} />
          </Tooltip>
        )}
        {isWinnerShown && team.winType != null && (
          <Tooltip label={team.winType} withArrow={true}>
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
