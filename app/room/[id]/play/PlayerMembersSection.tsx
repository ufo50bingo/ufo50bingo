import { Accordion, Stack, Text } from "@mantine/core";
import { CasterMember, PlayerMember } from "../common/useMembers";
import TeamPlayers from "@/app/matches/TeamPlayers";
import MemberLink from "@/app/matches/MemberLink";

interface Props {
  players: ReadonlyArray<PlayerMember>;
  casters: ReadonlyArray<CasterMember>;
}

export default function PlayerMembersSection({ players, casters }: Props) {
  return (
    <Accordion.Item value="members">
      <Accordion.Control>Members</Accordion.Control>
      <Accordion.Panel>
        <Stack>
          <Text>
            <strong>Players</strong>
          </Text>
          <Stack>
            {/* the same as a player on the match list */}
            {players.map((p) => (
              <TeamPlayers
                key={p.userId}
                team={{ color: p.color, players: [p] }}
                isWinnerShown={false}
                isWinner={false}
                size="md"
              />
            ))}
          </Stack>
          <Text>
            <strong>Casters</strong>
          </Text>
          <Stack>
            {casters.map((c) => (
              <MemberLink
                key={c.userId}
                userId={c.userId}
                name={c.name}
                image={c.image}
                size="md"
              />
            ))}
          </Stack>
        </Stack>
      </Accordion.Panel>
    </Accordion.Item>
  );
}
