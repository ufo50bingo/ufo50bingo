"use client";

import { PageSession } from "@/app/getSession";
import LoginButton from "@/app/LoginButton";
import {
  Alert,
  Button,
  Card,
  Container,
  Stack,
  TextInput,
  Title,
} from "@mantine/core";
import { useState } from "react";
import { confirmAnonymous } from "./confirmAnonymous";
import { useRouter } from "next/navigation";

type Props = {
  gameId: number;
  session: null | PageSession;
};

export default function Login({ gameId, session }: Props) {
  const [clickedAnon, setClickedAnon] = useState(false);
  const [name, setName] = useState("");
  const router = useRouter();
  return (
    <Container>
      <Card shadow="sm" padding="sm" radius="md" withBorder={true}>
        <Card.Section inheritPadding={true} py="sm" withBorder={true}>
          <Stack>
            <Title order={1}>Login Required</Title>
            <span>
              To play or cast a match, you must log in with Discord.
              <br />
              ufo50.bingo will only access your public profile data.
            </span>
            <LoginButton />
            {clickedAnon ? (
              <>
                <Alert color="yellow">
                  Are you sure you want to continue without Discord? ufo50.bingo
                  works better with Discord, and we will only access your
                  account's public data.
                </Alert>
                {session == null && (
                  <TextInput
                    label="Name"
                    onChange={(event) => setName(event.target.value)}
                  />
                )}
                <Button
                  variant="subtle"
                  disabled={session == null && name.length === 0}
                  onClick={async () => {
                    await confirmAnonymous(gameId, name);
                    // Not sure why we need to refresh here.
                    // The server action should do it automatically
                    router.refresh();
                  }}
                  color="red"
                >
                  Continue without Discord
                </Button>
              </>
            ) : (
              <Button variant="subtle" onClick={() => setClickedAnon(true)}>
                Continue without Discord
              </Button>
            )}
          </Stack>
        </Card.Section>
      </Card>
    </Container>
  );
}
