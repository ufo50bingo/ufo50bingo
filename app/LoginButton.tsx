import { Button } from "@mantine/core";
import { authClient } from "./authClient";
import { IconBrandDiscordFilled } from "@tabler/icons-react";

export default function LoginButton() {
  return (
    <Button
      w="100%"
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
