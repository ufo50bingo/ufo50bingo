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
import { useRouter } from "next/navigation";
import { authClient } from "@/app/authClient";

type Props = {
  gameId: number;
  session: null | PageSession;
};

export default function Login({ gameId, session }: Props) {
  const [clickedAnon, setClickedAnon] = useState(false);
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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
                    placeholder="Choose a display name"
                    onChange={(event) => setName(event.target.value)}
                  />
                )}
                <Button
                  variant="subtle"
                  disabled={
                    (session == null && name.trim().length === 0) || isLoading
                  }
                  onClick={async () => {
                    setIsLoading(true);
                    if (session == null) {
                      await authClient.signIn.anonymous({
                        fetchOptions: {
                          headers: {
                            "x-anonymous-name": encodeURIComponent(name.trim()),
                          },
                        },
                      });
                    }
                    document.cookie =
                      `anonymous-confirmed-${gameId}=true; ` +
                      `max-age=${24 * 60 * 60}; samesite=lax; path=/room/${gameId}`;
                    router.refresh();
                  }}
                  color="red"
                >
                  Continue without Discord
                </Button>
              </>
            ) : (
              <Button variant="subtle" onClick={() => setClickedAnon(true)}>
                I don't have Discord
              </Button>
            )}
          </Stack>
        </Card.Section>
      </Card>
    </Container>
  );
}
