import { Group, Text, Tooltip } from "@mantine/core";
import BingoIcon from "./BingoIcon";
import classes from "./MatchRow.module.css";
import { getColorHex } from "../color";
import { MatchTeamWithResult } from "./useTeamsWithResults";

type Props = {
  team: MatchTeamWithResult;
  size: "md" | "lg";
  isWinnerShown?: boolean;
};

export default function TeamScoreCell({
  team,
  size,
  isWinnerShown = true,
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
      <span className={classes.iconSlot}>
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
