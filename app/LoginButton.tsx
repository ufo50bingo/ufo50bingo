import { Button, Text } from "@mantine/core";
import { authClient } from "./authClient";
import { IconBrandDiscordFilled } from "@tabler/icons-react";

export default function LoginButton() {
  const { data: session, isPending } = authClient.useSession();
  if (isPending) {
    return "Loading...";
  }
  if (session == null) {
    return (
      <Button
        leftSection={<IconBrandDiscordFilled size={20} />}
        onClick={() =>
          authClient.signIn.social({
            provider: "discord",
            callbackURL: window.location.href,
          })
        }
      >
        Sign in
      </Button>
    );
  }
  return <Text>Signed in as {session.user.name}</Text>;
}
