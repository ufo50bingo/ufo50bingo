"use client";

import { useState } from "react";
import { IconBrandTwitch, IconCheck, IconExclamationMark } from "@tabler/icons-react";
import {
  Alert,
  Button,
  Select,
  Stack,
  TextInput,
  Tooltip,
} from "@mantine/core";
import createPasta from "./createPasta";
import getDefaultDifficulties from "./getDefaultDifficulties";
import createMatch from "./createMatch";
import { db } from "../db";
import { STANDARD } from "../pastas/standard";
import {
  ALL_PLAYERS,
  getCurrentWeek,
  PLAYER_TO_TIER,
  WEEKS,
} from "./leagueConstants";
import Link from "next/link";

const ROOM_PREFIX = "https://www.bingosync.com/room/";
const LEAGUE_SEASON = 2;

export default function LeagueMatch() {
  const [week, setWeek] = useState<null | string>(getCurrentWeek());
  const [p1, setP1] = useState<null | string>(null);
  const [p2, setP2] = useState<null | string>(null);
  const [password, setPassword] = useState("");
  const [isCreationInProgress, setIsCreationInProgress] = useState(false);
  const [url, setUrl] = useState("");
  const [error, setError] = useState<Error | null>(null);

  const p1Tier = p1 != null ? PLAYER_TO_TIER[p1] : null;
  const p2Tier = p2 != null ? PLAYER_TO_TIER[p2] : null;

  const tierMismatch = p1 != null && p2 != null && p1Tier != p2Tier;
  const id = url.slice(ROOM_PREFIX.length);

  return (
    <Stack gap={8}>
      <Select label="Week" data={WEEKS} value={week} onChange={setWeek} />
      <Select
        spellCheck={false}
        searchable={true}
        data={ALL_PLAYERS}
        label="First player"
        value={p1}
        onChange={setP1}
      />
      <Select
        spellCheck={false}
        searchable={true}
        data={ALL_PLAYERS}
        label="Second player"
        value={p2}
        onChange={setP2}
      />
      {tierMismatch && (
        <Alert
          variant="light"
          color="red"
          title={`${p1} (${p1Tier}) and ${p2} (${p2Tier}) are in different tiers!`}
        >
          To create a League match, you must select two players in the same
          tier.
        </Alert>
      )}
      <TextInput
        spellCheck={false}
        label="Choose password"
        value={password}
        onChange={(event) => setPassword(event.currentTarget.value)}
      />
      <Button
        mt="md"
        disabled={
          isCreationInProgress ||
          week == null ||
          p1 == null ||
          p2 == null ||
          tierMismatch ||
          password === ""
        }
        onClick={async () => {
          setIsCreationInProgress(true);
          try {
            if (
              p1 == null ||
              p2 == null ||
              week == null ||
              p1Tier == null ||
              p1Tier !== p2Tier
            ) {
              throw new Error("Unexpected null when creating match");
            }
            const url = await createMatch({
              roomName: `${p1} vs ${p2}`,
              password,
              isPublic: true,
              variant: "Standard",
              isCustom: false,
              isLockout: true,
              pasta: JSON.stringify(
                createPasta(STANDARD, getDefaultDifficulties(STANDARD))
              ),
              leagueInfo: {
                season: LEAGUE_SEASON,
                p1,
                p2,
                week,
                tier: p1Tier,
              },
            });
            const id = url.slice(ROOM_PREFIX.length);
            db.createdMatches.add({ id });
            setError(null);
            setUrl(url);
            setIsCreationInProgress(false);
            window.open(url, "_blank");
          } catch (err: unknown) {
            setIsCreationInProgress(false);
            setUrl("");
            if (err instanceof Error) {
              setError(err);
            } else {
              setError(new Error("unknown error!"));
            }
          }
        }}
        color="green"
      >
        Create Bingosync Board
      </Button>
      <Tooltip
        label={
          <>
            Please use the Copy button only if you need to reset an existing
            room,
            <br />
            e.g. if a player accidentally reveals the card early.
          </>
        }
      >
        <Button
          onClick={() => {
            navigator.clipboard.writeText(
              JSON.stringify(
                createPasta(STANDARD, getDefaultDifficulties(STANDARD)),
                null,
                4
              )
            );
          }}
        >
          Copy Pasta to Clipboard
        </Button>
      </Tooltip>
      {url !== "" && (
        <Alert
          variant="light"
          title="New casting tools!"
          icon={<IconBrandTwitch />}
        >
          We have new casting tools! <Link href={`/cast/${id}`}>Try them out here!</Link>
        </Alert>
      )}
      {url !== "" && (
        <Alert
          variant="light"
          color="green"
          title="Success!"
          icon={<IconCheck />}
        >
          Your bingo board is available at{" "}
          <a href={url} target="_blank">
            {url}
          </a>
          .
          <Link href={`/match/${id}`} target="_blank">
            Your Match results can be viewed here.
          </Link>
        </Alert>
      )}
      {error != null && (
        <Alert
          variant="light"
          color="red"
          title="Failed to create bingo board"
          icon={<IconExclamationMark />}
        >
          {error.message}
        </Alert>
      )}
    </Stack>
  );
}
