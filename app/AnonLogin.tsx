import { Button } from "@mantine/core";
import { authClient } from "./authClient";

export default function AnonLogin() {
  return (
    <Button onClick={() => authClient.signIn.anonymous()}>Anon Sign In</Button>
  );
}
