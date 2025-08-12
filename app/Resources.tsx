import { Card, Container, List, Stack, Text } from '@mantine/core';

export default function Resources() {
  return (
    <Container my="md">
      <Card shadow="sm" padding="sm" radius="md" withBorder>
        <List>
          <List.Item>
            <a
              href="https://docs.google.com/document/d/1VRHljWeJ3lHuN3ou-9R0kMgwoZeCcaEPBsRCI1nWEig/edit?tab=t.0#heading=h.us0d6jom1jp"
              target="_blank"
            >
              Rules
            </a>
          </List.Item>
          <List.Item>
            <a
              href="https://docs.google.com/document/d/1XyEh20vdf7jtfYW94iIRHmf5YOQ0B-lZ2yh9lJjMMbM/edit?tab=t.kp6kpouepb5x#heading=h.j62u031oka5t"
              target="_blank"
            >
              Overview and Goals
            </a>
          </List.Item>
          <List.Item>
            <a
              href="https://docs.google.com/document/d/1RK6UH8mte79lF7yobr9yvkdpMHINBRBRV3hjJVb4MIk/edit?tab=t.0#heading=h.uxdzbgi90akp"
              target="_blank"
            >
              Goal Resources
            </a>
          </List.Item>
          <List.Item>
            <a
              href="https://docs.google.com/spreadsheets/d/1aYcmIA1KoviLQvQHDNTfzkIyG_BwHrO1cTtgimZtWZw/edit?gid=521253915#gid=521253915"
              target="_blank"
            >
              League Rules
            </a>
          </List.Item>
          <List.Item>
            <a
              href="https://docs.google.com/spreadsheets/d/1aYcmIA1KoviLQvQHDNTfzkIyG_BwHrO1cTtgimZtWZw/edit?gid=521253915#gid=521253915"
              target="_blank"
            >
              Bingo League Season 1 (Ended May 4, 2025)
            </a>
          </List.Item>
        </List>
      </Card>
    </Container>
  );
}
