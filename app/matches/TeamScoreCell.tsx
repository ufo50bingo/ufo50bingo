import { Group, Text, Tooltip } from "@mantine/core";
import getColorHex from "../room/[id]/cast/getColorHex";
import BingoIcon from "./BingoIcon";
import { WinType } from "./matchUtil";
import { BingosyncColor } from "./parseBingosyncData";
import { MatchTeam } from "./useTeams";
import classes from "./MatchRow.module.css";

type Props = {
  team: MatchTeam;
  winType: WinType | null;
  getScore: (color: BingosyncColor) => number;
  size: "md" | "lg";
};

export default function TeamScoreCell({
  team,
  winType,
  getScore,
  size,
}: Props) {
  const iconColor = getColorHex(team.color);
  return (
    <Group gap={6} wrap="nowrap" justify="flex-end" align="center">
      <Text lh={1} size={size} c={winType != null ? undefined : "dimmed"}>
        {winType != null ? (
          <strong>{getScore(team.color)}</strong>
        ) : (
          getScore(team.color)
        )}
      </Text>
      <span className={classes.iconSlot}>
        {winType != null && (
          <Tooltip label={winType} withArrow>
            <span className={classes.winIcon}>
              <BingoIcon
                size={size === "md" ? 16 : 20}
                color={iconColor}
                winType={winType}
              />
            </span>
          </Tooltip>
        )}
      </span>
    </Group>
  );
}
