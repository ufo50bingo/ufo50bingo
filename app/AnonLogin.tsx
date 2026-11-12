import { Button } from "@mantine/core";
import { authClient } from "./authClient";

export default function AnonLogin() {
  return (
    <Button w="100%" onClick={() => authClient.signIn.anonymous()}>
      Anon Sign In
    </Button>
  );
}
