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
import { refreshFromDiscord, updateNameAndPronouns } from "./updateProfile";
import { MAX_NAME_LENGTH, MAX_PRONOUNS_LENGTH } from "./profileLimits";

export type ProfileUser = {
  id: number;
  name: string;
  username: null | string;
  image: null | string;
  pronouns: null | string;
};

export default function UserProfile({ user }: { user: ProfileUser }) {
  const { data: session } = authClient.useSession();
  const isOwnProfile =
    session != null &&
    session.user.isAnonymous !== true &&
    session.user.id === String(user.id);

  // null when not editing
  const [edited, setEdited] = useState<null | {
    name: string;
    pronouns: string;
  }>(null);
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

  const trimmedName = edited?.name.trim() ?? "";
  const trimmedPronouns = edited?.pronouns.trim() ?? "";
  const canSave =
    trimmedName !== "" &&
    trimmedName.length <= MAX_NAME_LENGTH &&
    trimmedPronouns.length <= MAX_PRONOUNS_LENGTH &&
    (trimmedName !== user.name || trimmedPronouns !== (user.pronouns ?? ""));

  return (
    <Container my="md">
      <Stack>
        <Group justify="space-between" wrap="nowrap">
          <Group gap="md">
            <Avatar src={user.image} alt={user.name} size={96} />
            <Stack gap={0}>
              {edited == null ? (
                <Group gap="xs">
                  <Title order={2}>
                    {user.name}
                    {user.pronouns != null && ` (${user.pronouns})`}
                  </Title>
                  {isOwnProfile && (
                    <Tooltip label="Edit name and pronouns">
                      <ActionIcon
                        variant="subtle"
                        color="gray"
                        disabled={isSaving}
                        onClick={() =>
                          setEdited({
                            name: user.name,
                            pronouns: user.pronouns ?? "",
                          })
                        }
                        aria-label="Edit name and pronouns"
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
                    placeholder="Name"
                    value={edited.name}
                    maxLength={MAX_NAME_LENGTH}
                    onChange={(event) =>
                      setEdited({ ...edited, name: event.target.value })
                    }
                  />
                  <TextInput
                    aria-label="Pronouns"
                    placeholder="they/them"
                    value={edited.pronouns}
                    maxLength={MAX_PRONOUNS_LENGTH}
                    onChange={(event) =>
                      setEdited({ ...edited, pronouns: event.target.value })
                    }
                  />
                  <Button
                    disabled={isSaving || !canSave}
                    onClick={() =>
                      run(() =>
                        updateNameAndPronouns(trimmedName, trimmedPronouns),
                      )
                    }
                  >
                    Save
                  </Button>
                  <Button
                    variant="default"
                    disabled={isSaving}
                    onClick={() => setEdited(null)}
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
