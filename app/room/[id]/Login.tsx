"use client";

import {
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

type Props = {
  id: string;
};

export default function Login({ id }: Props) {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [view, setView] = useState<null | RoomView>(null);

  const submit = async () => {
    if (name !== "" && password !== "" && view != null) {
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
              <a href={`https://www.bingosync.com/room/${id}`} target="_blank">
                click here
              </a>
              .
            </span>
            <span>Are you playing or casting?</span>
            <SegmentedControl
              data={[
                {
                  value: "playing",
                  label: "Playing",
                },
                { value: "casting", label: "Casting" },
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
                  Pauses can be requested, and players on the ufo50.bingo page
                  will have their board hidden and hear a notification sound.
                </ListItem>
              </List>
            </Stack>
          </Card.Section>
        )}
        {view === "play" && (
          <Card.Section inheritPadding={true} py="sm" withBorder={true}>
            <Stack>
              <span>Use this view to play a match! Features include:</span>
              <List>
                <ListItem>Built-in timer and score tracking.</ListItem>
                <ListItem>General goals are tagged automatically.</ListItem>
                <ListItem>
                  Your device will not sleep while the page is open.
                </ListItem>
                <ListItem>Disconnections are detected automatically.</ListItem>
                <ListItem>
                  Notification sounds can be played when pauses are requested,
                  chat messages are received, or squares are marked.
                </ListItem>
                <ListItem>
                  Pauses can be requested, and players on the ufo50.bingo page
                  will have their board hidden and hear a notification sound.
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
