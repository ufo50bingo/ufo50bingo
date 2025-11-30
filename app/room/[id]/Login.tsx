"use client";

import {
  Alert,
  Button,
  Card,
  Container,
  List,
  ListItem,
  SegmentedControl,
  Stack,
  TextInput,
  Title,
} from "@mantine/core";
import { useState } from "react";
import { RoomView } from "./roomCookie";
import createRoomCookie from "./createRoomCookie";
import useDefaultName from "./useDefaultName";
import { useSearchParams } from "next/navigation";

type Props = {
  id: string;
};

export default function Login({ id }: Props) {
  const searchParams = useSearchParams();
  const [defaultName, setDefaultName] = useDefaultName();

  const [name, setName] = useState(defaultName);
  const [password, setPassword] = useState(searchParams.get("p") ?? "");
  const [view, setView] = useState<null | RoomView>(null);

  const submit = async () => {
    if (name !== "" && password !== "" && view != null) {
      setDefaultName(name);
      await createRoomCookie(id, name, password, view);
    }
  };
  return (
    <Container>
      <Card shadow="sm" padding="sm" radius="md" withBorder={true}>
        <Card.Section inheritPadding={true} py="sm" withBorder={true}>
          <Stack>
            <Title order={1}>Play or Cast a Match</Title>
            <span>
              Please copy this URL and send it to all players and casters!
              <br />
              If you prefer to use the standard Bingosync page,{" "}
              <a href={`https://celestebingo.rhelmot.io/room/${id}`} target="_blank">
                click here
              </a>
              .
            </span>
            <Alert>
              Please note that the Playing and Casting pages currently support
              only <strong>Lockout</strong> games.{" "}
              <a href={`https://celestebingo.rhelmot.io/room/${id}`} target="_blank">
                For non-Lockout games, use the old Bingosync page.
              </a>
            </Alert>
            <span>Are you playing or casting?</span>
            <SegmentedControl
              data={[
                {
                  value: "play",
                  label: "Playing",
                },
                { value: "cast", label: "Casting" },
              ]}
              fullWidth={true}
              onChange={setView as unknown as (value: string) => void}
              value={view as unknown as string}
            />
          </Stack>
        </Card.Section>
        {view === "cast" && (
          <Card.Section inheritPadding={true} py="sm" withBorder={true}>
            <Stack>
              <span>Use this view to cast a match! Features include:</span>
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
                  Progress is synced between all casters and displayed next to
                  the board.
                </ListItem>
                <ListItem>
                  General goals display a list of all relevant games, with
                  fastest games first by default. Alphabetical and chronological
                  sorting options are available also.
                </ListItem>
                <ListItem>
                  Possible synergies are underlined, and hovering shows the
                  relevant other goals and their positions on the board in [row,
                  column] format.
                </ListItem>
                <ListItem>
                  A countdown button can automatically count down to board
                  reveal and match start in chat.
                </ListItem>
                <ListItem>
                  Casters can request a pause, which will hide the board and
                  play an alert for all players connected via ufo50.bingo.
                </ListItem>
                <ListItem>
                  Casters can clear or grant squares to players without needing
                  to log in on a separate window. Just click on a square!
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
                <ListItem>
                  Game stats can be synced to files on your computer for
                  customized stream layouts.
                </ListItem>
              </List>
            </Stack>
          </Card.Section>
        )}
        {view === "play" && (
          <Card.Section inheritPadding={true} py="sm" withBorder={true}>
            <Stack>
              <Alert color="yellow">
                This page is brand new! Please try it out in an unofficial test
                match before using it for an important league match. If you're
                not sure you want to use the new UI,{" "}
                <a
                  href={`https://celestebingo.rhelmot.io/room/${id}`}
                  target="_blank"
                >
                  go to the old Bingosync room instead
                </a>
                .
              </Alert>
              <span>Use this view to play a match! Features include:</span>
              <List>
                <ListItem>
                  There is a built-in timer, which automatically starts when you
                  reveal the board.
                </ListItem>
                <ListItem>General goals are tagged automatically.</ListItem>
                <ListItem>General goals have a simple tracker.</ListItem>
                <ListItem>
                  Your device will not sleep while the page is open.
                </ListItem>
                <ListItem>Disconnections are detected automatically.</ListItem>
                <ListItem>
                  Notification sounds can be played when pauses are requested,
                  chat messages are received, or squares are marked.
                </ListItem>
                <ListItem>
                  Pauses can be requested. All users connected via ufo50.bingo
                  will have their board hidden and hear an alert.
                </ListItem>
              </List>
            </Stack>
          </Card.Section>
        )}
        {view != null && (
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
              <Button
                disabled={name === "" || password === ""}
                onClick={submit}
              >
                Access {view === "cast" ? "caster" : "player"} view
              </Button>
            </Stack>
          </Card.Section>
        )}
      </Card>
    </Container>
  );
}
