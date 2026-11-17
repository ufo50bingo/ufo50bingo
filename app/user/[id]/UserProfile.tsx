"use client";

import {
  ActionIcon,
  Alert,
  Avatar,
  Button,
  Container,
  Group,
  Stack,
  Text,
  TextInput,
  Title,
  Tooltip,
} from "@mantine/core";
import { IconPencil, IconRefresh } from "@tabler/icons-react";
import { useState } from "react";
import { authClient } from "@/app/authClient";
import { refreshFromDiscord, updateName } from "./updateProfile";
import { MAX_NAME_LENGTH } from "./maxNameLength";

export type ProfileUser = {
  id: number;
  name: string;
  username: null | string;
  image: null | string;
};

export default function UserProfile({ user }: { user: ProfileUser }) {
  const { data: session } = authClient.useSession();
  const isOwnProfile =
    session != null &&
    session.user.isAnonymous !== true &&
    session.user.id === String(user.id);

  // null when not editing
  const [editedName, setEditedName] = useState<null | string>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasError, setHasError] = useState(false);

  const run = async (action: () => Promise<void>) => {
    setIsSaving(true);
    setHasError(false);
    try {
      await action();
      window.location.reload();
    } catch {
      setHasError(true);
      setIsSaving(false);
    }
  };

  const trimmedName = editedName?.trim() ?? "";
  const canSaveName =
    trimmedName !== "" &&
    trimmedName.length <= MAX_NAME_LENGTH &&
    trimmedName !== user.name;

  return (
    <Container my="md">
      <Stack>
        <Group justify="space-between" wrap="nowrap">
          <Group gap="md">
            <Avatar src={user.image} alt={user.name} size={96} />
            <Stack gap={0}>
              {editedName == null ? (
                <Group gap="xs">
                  <Title order={2}>{user.name}</Title>
                  {isOwnProfile && (
                    <Tooltip label="Edit name">
                      <ActionIcon
                        variant="subtle"
                        color="gray"
                        disabled={isSaving}
                        onClick={() => setEditedName(user.name)}
                        aria-label="Edit name"
                      >
                        <IconPencil size={16} />
                      </ActionIcon>
                    </Tooltip>
                  )}
                </Group>
              ) : (
                <Group gap="xs">
                  <TextInput
                    aria-label="Name"
                    value={editedName}
                    maxLength={MAX_NAME_LENGTH}
                    onChange={(event) => setEditedName(event.target.value)}
                  />
                  <Button
                    disabled={isSaving || !canSaveName}
                    onClick={() => run(() => updateName(trimmedName))}
                  >
                    Save
                  </Button>
                  <Button
                    variant="default"
                    disabled={isSaving}
                    onClick={() => setEditedName(null)}
                  >
                    Cancel
                  </Button>
                </Group>
              )}
              {user.username != null && (
                <Text c="dimmed">@{user.username}</Text>
              )}
            </Stack>
          </Group>
          {isOwnProfile && (
            <Tooltip label="Refresh from Discord">
              <ActionIcon
                variant="subtle"
                color="gray"
                size="lg"
                disabled={isSaving}
                onClick={() => run(refreshFromDiscord)}
                aria-label="Refresh from Discord"
              >
                <IconRefresh size={18} />
              </ActionIcon>
            </Tooltip>
          )}
        </Group>
        {hasError && (
          <Text c="red" size="sm">
            Something went wrong. Please try again.
          </Text>
        )}
        <Alert>Coming soon!</Alert>
      </Stack>
    </Container>
  );
}
