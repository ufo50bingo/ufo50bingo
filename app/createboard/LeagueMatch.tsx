"use client";

import { useState } from "react";
import { IconCheck, IconExclamationMark } from "@tabler/icons-react";
import {
  Alert,
  Button,
  Checkbox,
  NumberInput,
  Select,
  Stack,
  TextInput,
  Tooltip,
} from "@mantine/core";
import createMatch from "./createMatch";
import { db } from "../db";
import {
  ALL_PLAYERS,
  getCurrentWeek,
  LEAGUE_SEASON,
  PLAYER_TO_TIER,
  WEEKS,
} from "./leagueConstants";
import Link from "next/link";
import { STANDARD_UFO } from "../pastas/standardUfo";
import ufoGenerator from "../generator/ufoGenerator";

export default function LeagueMatch() {
  const [week, setWeek] = useState<null | string>(getCurrentWeek());
  const [p1, setP1Raw] = useState<null | string>(null);
  const [p2, setP2Raw] = useState<null | string>(null);
  const [password, setPassword] = useState("");
  const [isCreationInProgress, setIsCreationInProgress] = useState(false);
  const [url, setUrl] = useState("");
  const [id, setId] = useState<null | string>(null);
  const [error, setError] = useState<Error | null>(null);
  const [gameNumber, setGameNumber] = useState<null | number>(null);

  const p1Tier = p1 != null ? PLAYER_TO_TIER[p1] : null;
  const p2Tier = p2 != null ? PLAYER_TO_TIER[p2] : null;

  const updateGameNumberIfNecessary = (
    newP1: null | string,
    newP2: null | string,
  ) => {
    if (newP1 != null && newP2 != null) {
      const newP1Tier = PLAYER_TO_TIER[newP1];
      const newP2Tier = PLAYER_TO_TIER[newP2];
      if (newP1Tier === newP2Tier) {
        if (newP1Tier === "A" && gameNumber == null) {
          setGameNumber(1);
        } else if (newP1Tier !== "A" && gameNumber != null) {
          setGameNumber(null);
        }
      }
    }
  };

  const setP1 = (newP1: null | string) => {
    setP1Raw(newP1);
    updateGameNumberIfNecessary(newP1, p2);
  };

  const setP2 = (newP2: null | string) => {
    setP2Raw(newP2);
    updateGameNumberIfNecessary(p1, newP2);
  };

  const tierMismatch = p1 != null && p2 != null && p1Tier != p2Tier;

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
      <Checkbox
        checked={gameNumber != null}
        onChange={(event) =>
          event.currentTarget.checked ? setGameNumber(1) : setGameNumber(null)
        }
        label="Is part of multi-game series"
      />
      {gameNumber == null && p1Tier === "A" && p2Tier === "A" && (
        <Alert variant="light" color="yellow">
          A tier players are expected to play a 2-game series every week. Please
          select "Is part of multi-game series" unless you have special
          circumstances.
        </Alert>
      )}
      {gameNumber != null &&
        p1Tier !== "A" &&
        p2Tier !== "A" &&
        p1Tier != null &&
        p2Tier != null && (
          <Alert variant="light" color="yellow">
            Only A tier players are expected to play a multi-game series. Please
            deselect "Is part of multi-game series" unless you have special
            circumstances.
          </Alert>
        )}
      {gameNumber != null && (
        <NumberInput
          label="Game number"
          value={gameNumber}
          onChange={(newValue) => setGameNumber(newValue as number)}
          min={1}
          max={99}
          allowNegative={false}
          allowDecimal={false}
        />
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
              p1Tier !== p2Tier ||
              LEAGUE_SEASON == null
            ) {
              throw new Error("Unexpected null when creating match");
            }
            const gameSuffix = gameNumber == null ? "" : `, Game ${gameNumber}`;
            const id = await createMatch({
              roomName: `${p1} vs ${p2}${gameSuffix}`,
              password,
              isPublic: true,
              variant: "Standard",
              bingosyncVariant: "18",
              isCustom: false,
              isLockout: true,
              pasta: JSON.stringify(
                ufoGenerator(STANDARD_UFO).map((goal) => ({ name: goal })),
              ),
              leagueInfo: {
                season: LEAGUE_SEASON,
                p1,
                p2,
                week,
                tier: p1Tier,
                game: gameNumber,
              },
            });
            const passwordParams = new URLSearchParams({
              p: password,
            }).toString();
            const url = `/room/${id}?${passwordParams}`;
            db.createdMatches.add({ id });
            setError(null);
            setUrl(url);
            setId(id);
            setIsCreationInProgress(false);
            window.open(url, "_blank");
          } catch (err: unknown) {
            setIsCreationInProgress(false);
            setUrl("");
            setId(null);
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
                ufoGenerator(STANDARD_UFO).map((goal) => ({ name: goal })),
                null,
                2,
              ),
            );
          }}
        >
          Copy Pasta to Clipboard
        </Button>
      </Tooltip>
      {url !== "" && (
        <Alert
          variant="light"
          color="green"
          title="Success!"
          icon={<IconCheck />}
        >
          <a href={url} target="_blank">
            Your new room is available at here.
          </a>
          <br />
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
