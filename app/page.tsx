"use client";

import { useState } from "react";
import Link from "next/link";
import { IconCheck, IconDots, IconExclamationMark } from "@tabler/icons-react";
import {
  ActionIcon,
  Alert,
  Button,
  Card,
  Checkbox,
  Container,
  Group,
  JsonInput,
  Menu,
  SegmentedControl,
  Stack,
  Text,
  TextInput,
  Title,
  Tooltip,
} from "@mantine/core";
import createPasta, { Pasta } from "./createPasta";
import createPastaWithoutDifficulty from "./createPastaWithoutDifficulty";
import GameChecker from "./GameChecker";
import getDefaultDifficulties from "./getDefaultDifficulties";
import { Game, GAME_NAMES, ORDERED_PROPER_GAMES } from "./goals";
import PastaFilter from "./PastaFilter";
import { METADATA, Variant, VariantMetadata } from "./pastas/metadata";
import VariantHoverCard from "./VariantHoverCard";
import createMatch from "./createMatch";
import { HAS_MATCHES } from "./constants";

const options: ReadonlyArray<VariantMetadata> = METADATA.filter(
  (d) => !d.isMenu
);
const menuOptions: ReadonlyArray<VariantMetadata> = METADATA.filter(
  (d) => d.isMenu
);

export default function CreateBoard() {
  const [variant, setVariant] = useState<Variant>(options[0].name);
  const [custom, setCustom] = useState("");
  const [checkState, setCheckState] = useState<Map<Game, boolean>>(
    new Map(ORDERED_PROPER_GAMES.map((key) => [key, true]))
  );

  const [customizedPasta, setCustomizedPasta] = useState<null | Pasta>(null);

  const [randomizeGroupings, setRandomizeGroupings] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [roomName, setRoomName] = useState("");
  const [password, setPassword] = useState("");
  const [isLockout, setIsLockout] = useState(true);
  const [isPublicRaw, setIsPublicRaw] = useState(HAS_MATCHES);
  const [isCreationInProgress, setIsCreationInProgress] = useState(false);
  const [url, setUrl] = useState("");
  const [error, setError] = useState<Error | null>(null);

  const isPublic = isPublicRaw && isLockout;

  const [showNUX, setShowNUX] = useState(
    global.window != undefined && localStorage?.getItem("showNUX") !== "false"
  );

  const metadata = METADATA.find((d) => d.name === variant);

  // for some reason it doesn't like checkState.values().filter(...)
  let checkedGameCount = 0;
  checkState.forEach((isChecked) => {
    if (isChecked) {
      checkedGameCount += 1;
    }
  });
  const hasLessThan25Games = checkedGameCount < 25;
  const isEligibleForCustomizedPasta =
    variant === "Standard" || variant === "Spicy";
  const isEligibleForCustomizedPastaWithoutDifficulty =
    variant === "Nozzlo" || variant === "Blitz";
  const isUsingCustomizedPasta = isEligibleForCustomizedPasta && showFilters;

  const getSerializedPasta = (pretty: boolean) => {
    if (variant === "Custom") {
      return custom;
    }
    let structuredPasta;
    if (variant === "Game Names") {
      structuredPasta = showFilters
        ? Array.from(
            checkState.entries().filter(([_gameKey, checkState]) => checkState)
          ).map(([gameKey, _]) => ({ name: GAME_NAMES[gameKey] }))
        : ORDERED_PROPER_GAMES.map((gameKey) => ({
            name: GAME_NAMES[gameKey],
          }));
    } else if (
      (showFilters || randomizeGroupings) &&
      isEligibleForCustomizedPastaWithoutDifficulty &&
      metadata != null
    ) {
      structuredPasta = createPastaWithoutDifficulty(
        // TODO: Fix typing of pastas to be less strict
        metadata.pasta as any,
        showFilters ? checkState : null
      );
    } else if (isUsingCustomizedPasta && customizedPasta != null) {
      structuredPasta = customizedPasta;
    } else if (metadata?.pasta != null) {
      structuredPasta = randomizeGroupings
        ? createPasta(
            // TODO: Fix typing of pastas to be less strict
            metadata.pasta as any,
            getDefaultDifficulties(metadata.pasta as any)
          )
        : metadata.pasta;
    } else {
      return "Error constructing pasta";
    }
    return pretty
      ? JSON.stringify(structuredPasta, null, 4)
      : JSON.stringify(structuredPasta);
  };

  return (
    <Container my="md">
      <Stack gap={8}>
        {showNUX && (
          <Alert variant="light">
            <Group justify="space-between">
              <Link href="/about">
                <Title order={5}>
                  If you are new to UFO 50 Bingo, click here for more
                  information!
                </Title>
              </Link>
              <Button
                variant="subtle"
                onClick={() => {
                  setShowNUX(false);
                  window?.localStorage?.setItem("showNUX", "false");
                }}
              >
                Don't show this again
              </Button>
            </Group>
          </Alert>
        )}
        <Card shadow="sm" padding="sm" radius="md" withBorder>
          <Stack gap={8}>
            <Text>
              <strong>Choose variant</strong>
            </Text>
            <Group gap="sm">
              <SegmentedControl
                style={{ flexGrow: 1 }}
                data={options.map((option) => ({
                  value: option.name,
                  label: <VariantHoverCard metadata={option} />,
                }))}
                fullWidth={true}
                onChange={setVariant as unknown as (value: string) => void}
                value={variant}
              />
              <Menu shadow="md" width={200}>
                <Menu.Target>
                  <ActionIcon onClick={() => {}} variant="default">
                    <IconDots size={16} />
                  </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                  {menuOptions.map((option) => (
                    <Menu.Item
                      key={option.name}
                      onClick={() => setVariant(option.name)}
                    >
                      <VariantHoverCard metadata={option} />
                    </Menu.Item>
                  ))}
                </Menu.Dropdown>
              </Menu>
            </Group>
            {metadata?.update_time != null && (
              <Text size="sm">
                Last synced:{" "}
                {new Date(metadata.update_time * 1000).toLocaleString(
                  undefined,
                  {
                    month: "numeric",
                    day: "numeric",
                    year: "numeric",
                  }
                )}
              </Text>
            )}
            {(isEligibleForCustomizedPasta ||
              isEligibleForCustomizedPastaWithoutDifficulty ||
              variant === "Game Names") && (
              <Group>
                {variant !== "Game Names" && (
                  <Tooltip
                    label={
                      <span>
                        Games will be divided into groups randomly while still
                        respecting the
                        <br />
                        difficulty distribution, allowing for greater card
                        variety than using the
                        <br />
                        default pasta. This option is always enabled when
                        customizing games and
                        <br />
                        difficulty counts.
                      </span>
                    }
                  >
                    <Checkbox
                      checked={showFilters || randomizeGroupings}
                      label="Randomize goal groupings"
                      onChange={(event) =>
                        setRandomizeGroupings(event.currentTarget.checked)
                      }
                    />
                  </Tooltip>
                )}
                <Checkbox
                  checked={showFilters}
                  label={
                    isEligibleForCustomizedPasta
                      ? "Customize games and difficulty counts"
                      : "Customize games"
                  }
                  onChange={(event) =>
                    setShowFilters(event.currentTarget.checked)
                  }
                />
              </Group>
            )}
            {(isEligibleForCustomizedPastaWithoutDifficulty ||
              variant === "Game Names") &&
              showFilters && (
                <GameChecker
                  checkState={checkState}
                  setCheckState={setCheckState}
                />
              )}
            {variant === "Game Names" && showFilters && hasLessThan25Games && (
              <Alert
                variant="light"
                color="red"
                title="Error: You must select at least 25 games"
              />
            )}
            {metadata != null &&
              isEligibleForCustomizedPasta &&
              showFilters && (
                <PastaFilter
                  key={variant}
                  checkState={checkState}
                  setCheckState={setCheckState}
                  // TODO: Fix up the typing here to get rid of the any
                  pasta={metadata.pasta as any}
                  onChangePasta={setCustomizedPasta}
                />
              )}
            {variant === "Custom" && (
              <JsonInput
                autosize
                label="Add your pasta here:"
                maxRows={12}
                minRows={2}
                onChange={setCustom}
                spellCheck={false}
                validationError="Invalid JSON"
                value={custom}
              />
            )}
            <Text>
              <strong>Configure Room</strong>
            </Text>
            <TextInput
              label="Room name"
              value={roomName}
              onChange={(event) => setRoomName(event.currentTarget.value)}
            />
            <TextInput
              label="Password"
              value={password}
              onChange={(event) => setPassword(event.currentTarget.value)}
            />
            <Group>
              <Checkbox
                checked={isLockout}
                label="Lockout"
                onChange={(event) => setIsLockout(event.currentTarget.checked)}
              />
              {HAS_MATCHES && (
                <Tooltip
                  label={
                    isLockout ? (
                      <span>
                        Public games will be visible to all users on the Matches
                        tab.
                      </span>
                    ) : (
                      <span>Only Lockout games can be made Public.</span>
                    )
                  }
                >
                  <Checkbox
                    checked={isPublic}
                    disabled={!isLockout}
                    label="Public"
                    onChange={(event) =>
                      setIsPublicRaw(event.currentTarget.checked)
                    }
                  />
                </Tooltip>
              )}
            </Group>
            <Button
              disabled={
                isCreationInProgress ||
                roomName === "" ||
                password === "" ||
                (variant === "Game Names" &&
                  showFilters &&
                  hasLessThan25Games) ||
                (variant === "Custom" && custom === "") ||
                (isUsingCustomizedPasta && customizedPasta == null)
              }
              onClick={async () => {
                setIsCreationInProgress(true);

                try {
                  const url = await createMatch({
                    roomName,
                    password,
                    isPublic,
                    variant,
                    isCustom:
                      showFilters &&
                      [
                        "Standard",
                        "Spicy",
                        "Nozzlo",
                        "Blitz",
                        "Game Names",
                      ].includes(variant),
                    isLockout,
                    pasta: getSerializedPasta(false),
                    leagueSeason: null,
                  });
                  setError(null);
                  setUrl(url);
                  setIsCreationInProgress(false);
                  window.open(url, "_blank");
                } catch (err: any) {
                  setIsCreationInProgress(false);
                  setUrl("");
                  setError(err);
                }
              }}
              color="green"
            >
              Create Bingosync Board
            </Button>
            <Button
              disabled={isUsingCustomizedPasta && customizedPasta == null}
              onClick={() => {
                navigator.clipboard.writeText(getSerializedPasta(true));
              }}
            >
              Copy Pasta to Clipboard
            </Button>
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
        </Card>
      </Stack>
    </Container>
  );
}
