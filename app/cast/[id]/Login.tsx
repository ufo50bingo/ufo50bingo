"use client";

import {
  Button,
  Card,
  Container,
  List,
  ListItem,
  Stack,
  TextInput,
  Title,
} from "@mantine/core";
import { useParams } from "next/navigation";
import createSession from "./createSession";
import { useState } from "react";
import Link from "next/link";

export default function Login() {
  const { id } = useParams<{ id: string }>();

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const submit = async () => {
    if (name !== "" && password !== "") {
      await createSession(id, name, password);
    }
  };
  return (
    <Container>
      <Card shadow="sm" padding="sm" radius="md" withBorder={true}>
        <Card.Section inheritPadding={true} py="sm" withBorder={true}>
          <Stack>
            <Title order={1}>Cast a Match</Title>
            <span>
              <strong>
                If you are a player, please go to the{" "}
                <Link href={`https://www.bingosync.com/room/${id}`}>
                  official Bingosync room
                </Link>{" "}
                instead!
              </strong>
            </span>
            <span>Use this page to cast a match! Features include:</span>
            <List>
              <ListItem>
                The live board view displays difficulty tags on squares.
              </ListItem>
              <ListItem>
                Player score are computed automatically and displayed next to
                the board, with the tiebreaker winner underlined.
              </ListItem>
              <ListItem>
                General goal progress has per-game tracking for each player.
                Progress is synced between all casters and displayed next to the
                board.
              </ListItem>
              <ListItem>
                General goals display a list of all relevant games, with fastest
                games first by default. Alphabetical and chronological sorting
                options are available also.
              </ListItem>
              <ListItem>
                Possible synergies are underlined, and hovering shows the
                relevant other goals and their positions on the board in [row,
                column] format.
              </ListItem>
              <ListItem>
                A countdown button can automatically count down to board reveal
                and match start in chat.
              </ListItem>
              <ListItem>
                Casters can clear or grant squares to players without needing to
                log in on a separate window. Just click on a square!
              </ListItem>
              <ListItem>
                Leaderboard thresholds and gift requirements are displayed for
                every game.
              </ListItem>
              <ListItem>
                The "Create new board" button allows creating a new board
                without having to paste anything.
              </ListItem>
              <ListItem>Disconnections are detected automatically.</ListItem>
            </List>
          </Stack>
        </Card.Section>
        <Card.Section inheritPadding={true} py="sm" withBorder={true}>
          <Stack>
            <TextInput
              autoFocus={true}
              onKeyDown={async (event) => {
                if (event.key === "Enter") {
                  await submit();
                }
              }}
              label="Nickname"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            <TextInput
              onKeyDown={async (event) => {
                if (event.key === "Enter") {
                  await submit();
                }
              }}
              label="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <Button disabled={name === "" || password === ""} onClick={submit}>
              Access caster view
            </Button>
          </Stack>
        </Card.Section>
      </Card>
    </Container>
  );
}
