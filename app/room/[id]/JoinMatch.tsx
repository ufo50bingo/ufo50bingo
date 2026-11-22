"use client";

import {
  Alert,
  Button,
  Card,
  Checkbox,
  Container,
  SegmentedControl,
  Stack,
  TextInput,
  Title,
} from "@mantine/core";
import { useState } from "react";
import { RoomView } from "./roomCookie";
import { useSearchParams } from "next/navigation";
import { FeedMember } from "@/app/fetchFeed";
import ColorSelector from "./common/ColorSelector";
import { BingosyncColor } from "@/app/matches/parseBingosyncData";
import joinGame from "./joinGame";

type Props = {
  gameId: number;
  userId: number;
  userMember: null | FeedMember;
};

export default function JoinMatch({ gameId, userMember }: Props) {
  const searchParams = useSearchParams();

  const [shouldOverrideName, setShouldOverrideName] = useState(false);
  const [overrideName, setOverrideName] = useState<string>("");
  const [password, setPassword] = useState(searchParams.get("p") ?? "");
  // TODO: Set default color when not invited also
  const [color, setColor] = useState<BingosyncColor>(
    userMember?.playerColor ?? "red",
  );

  const invitedView =
    userMember == null
      ? null
      : userMember.playerColor == null
        ? "cast"
        : "play";
  const [view, setView] = useState<null | RoomView>(invitedView);

  const name = shouldOverrideName ? overrideName : null;
  const canSubmit =
    view != null && name !== "" && (password !== "" || userMember != null);
  const submit = async () => {
    if (canSubmit) {
      joinGame(gameId, view === "play" ? color : null, name);
    }
  };
  return (
    <Container>
      <Card shadow="sm" padding="sm" radius="md" withBorder={true}>
        <Card.Section inheritPadding={true} py="sm" withBorder={true}>
          <Stack>
            <Title order={1}>Play or Cast a Match</Title>
            <span>Copy this URL and send it to all players and casters!</span>
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
        {view != null && (
          <Card.Section inheritPadding={true} py="sm" withBorder={true}>
            {invitedView != null && view !== invitedView && (
              <Alert color="yellow">
                You were invited as a{" "}
                {invitedView === "cast" ? "Caster" : "Player"}. Are you sure you
                want to join as a {view === "cast" ? "Caster" : "Player"}?
              </Alert>
            )}
            <Stack>
              {view === "play" && (
                <ColorSelector
                  label="Choose color"
                  color={color}
                  setColor={setColor}
                />
              )}
              <Checkbox
                label="Use custom name"
                checked={shouldOverrideName}
                onChange={(event) =>
                  setShouldOverrideName(event.target.checked)
                }
              />
              {shouldOverrideName && (
                <TextInput
                  autoFocus={true}
                  onKeyDown={async (event) => {
                    if (event.key === "Enter") {
                      await submit();
                    }
                  }}
                  label="Custom name"
                  value={overrideName}
                  onChange={(event) => setOverrideName(event.target.value)}
                />
              )}
              {userMember == null && (
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
              )}
              <Button disabled={!canSubmit} onClick={submit}>
                Join as {view === "cast" ? "Caster" : "Player"}
              </Button>
            </Stack>
          </Card.Section>
        )}
      </Card>
    </Container>
  );
}
