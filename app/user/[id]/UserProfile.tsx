"use client";

import {
  Alert,
  Avatar,
  Container,
  Group,
  Stack,
  Text,
  Title,
} from "@mantine/core";

export type ProfileUser = {
  name: string;
  username: null | string;
  image: null | string;
};

export default function UserProfile({ user }: { user: ProfileUser }) {
  return (
    <Container my="md">
      <Stack>
        <Group gap="md">
          <Avatar src={user.image} alt={user.name} size={96} />
          <Stack gap={0}>
            <Title order={2}>{user.name}</Title>
            {user.username != null && <Text c="dimmed">@{user.username}</Text>}
          </Stack>
        </Group>
        <Alert>Coming soon!</Alert>
      </Stack>
    </Container>
  );
}
