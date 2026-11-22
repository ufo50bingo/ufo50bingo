import { Group } from "@mantine/core";
import { MatchTeam } from "./useTeams";
import MemberLink from "./MemberLink";
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
          <MemberLink
            key={p.userId}
            userId={p.userId}
            name={p.name}
            image={p.image}
            size={size}
            isDimmed={!isWinner && isWinnerShown}
            isBold={isWinner && isWinnerShown}
          />
        ))}
      </Group>
    </Group>
  );
}
