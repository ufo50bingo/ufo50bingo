import {
  Alert,
  Button,
  Group,
  Modal,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
} from "@mantine/core";
import { authClient } from "./authClient";
import { IconBrandDiscordFilled } from "@tabler/icons-react";
import Link from "next/link";
import { useState } from "react";
import { useMediaQuery } from "@mantine/hooks";
import LoginButton from "./LoginButton";

export default function SidebarLogin() {
  const { data: session, isPending } = authClient.useSession();
  const [isModalShown, setIsModalShown] = useState(false);
  const [anonName, setAnonName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const isMobile = useMediaQuery("(max-width: 525px)");
  if (isPending) {
    return null;
  }
  if (session != null && !session.user.isAnonymous) {
    return (
      <Text size="sm">
        <ThemeIcon
          component="span"
          color="indigo"
          size={16}
          style={{ verticalAlign: "text-bottom", borderRadius: "50%" }}
        >
          <IconBrandDiscordFilled size={12} />
        </ThemeIcon>{" "}
        Signed in as {session.user.name}
      </Text>
    );
  }
  if (session != null && session.user.isAnonymous) {
    return (
      <Stack gap={8}>
        <Text size="sm">Signed in as {session.user.name} without Discord.</Text>
        <LoginButton />
      </Stack>
    );
  }
  return (
    <Stack gap={8}>
      <LoginButton />
      <Link href="#" onClick={() => setIsModalShown(true)}>
        <Text size="sm">I don't have Discord</Text>
      </Link>
      {isModalShown && (
        <Modal
          fullScreen={isMobile}
          centered={true}
          onClose={() => setIsModalShown(false)}
          opened={true}
          title="Sign in without Discord"
        >
          <Stack>
            <Alert color="yellow">
              Are you sure you want to continue without Discord? ufo50.bingo
              works better with Discord, and we will only access your account's
              public data.
            </Alert>
            <TextInput
              placeholder="Choose a display name"
              onChange={(event) => setAnonName(event.target.value)}
            />
            <Group justify="flex-end">
              <Button onClick={() => setIsModalShown(false)}>Cancel</Button>
              <Button
                disabled={anonName === "" || isLoading}
                onClick={async () => {
                  setIsLoading(true);
                  await authClient.signIn.anonymous({
                    fetchOptions: {
                      headers: {
                        "x-anonymous-name": encodeURIComponent(anonName.trim()),
                      },
                    },
                  });
                }}
                color="red"
              >
                Continue without Discord
              </Button>
            </Group>
          </Stack>
        </Modal>
      )}
    </Stack>
  );
}
