import { Accordion, ColorSwatch, Group, Stack, Text } from "@mantine/core";
import getColorHex from "../cast/getColorHex";
import { CasterMember, PlayerMember } from "../common/useMembers";

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
            {players.map((p) => (
              <Group key={p.userId}>
                <ColorSwatch color={getColorHex(p.color)} size={14} />
                <span>{p.name}</span>
              </Group>
            ))}
          </Stack>
          <Text>
            <strong>Casters</strong>
          </Text>
          <Stack>
            {casters.map((c) => (
              <span key={c.userId}>{c.name}</span>
            ))}
          </Stack>
        </Stack>
      </Accordion.Panel>
    </Accordion.Item>
  );
}
