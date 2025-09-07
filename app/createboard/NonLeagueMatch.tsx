"use client";

import { useState } from "react";
import { IconCheck, IconDots, IconExclamationMark } from "@tabler/icons-react";
import {
  ActionIcon,
  Alert,
  Button,
  Checkbox,
  Group,
  JsonInput,
  Menu,
  SegmentedControl,
  Stack,
  Text,
  TextInput,
  Tooltip,
} from "@mantine/core";
import createPasta from "./createPasta";
import createPastaWithoutDifficulty from "./createPastaWithoutDifficulty";
import GameChecker from "./GameChecker";
import getDefaultDifficulties from "./getDefaultDifficulties";
import { Game, GAME_NAMES, ORDERED_PROPER_GAMES } from "../goals";
import PastaFilter from "./PastaFilter";
import {
  METADATA,
  OtherPasta,
  Pasta,
  Variant,
  VariantMetadata,
} from "../pastas/metadata";
import VariantHoverCard from "./VariantHoverCard";
import createMatch from "./createMatch";
import { db } from "../db";

const ROOM_PREFIX = "https://www.bingosync.com/room/";

const options: ReadonlyArray<VariantMetadata> = METADATA.filter(
  (d) => !d.isMenu
);
const menuOptions: ReadonlyArray<VariantMetadata> = METADATA.filter(
  (d) => d.isMenu
);

export default function NonLeagueMatch() {
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
  const [isPublicRaw, setIsPublicRaw] = useState(true);
  const [isCreationInProgress, setIsCreationInProgress] = useState(false);
  const [url, setUrl] = useState("");
  const [error, setError] = useState<Error | null>(null);

  const isPublic = isPublicRaw && isLockout;
  const metadata = METADATA.find((d) => d.name === variant)!;

  // for some reason it doesn't like checkState.values().filter(...)
  let checkedGameCount = 0;
  checkState.forEach((isChecked) => {
    if (isChecked) {
      checkedGameCount += 1;
    }
  });
  const hasLessThan25Games = checkedGameCount < 25;

  const getSerializedPasta = (pretty: boolean): string => {
    const stringify = (
      structured: OtherPasta | ReadonlyArray<{ name: string }>
    ) =>
      pretty ? JSON.stringify(structured, null, 4) : JSON.stringify(structured);
    switch (metadata.type) {
      case "Custom":
        return custom;
      case "GameNames":
        return stringify(
          showFilters
            ? Array.from(
                checkState
                  .entries()
                  .filter(([_gameKey, checkState]) => checkState)
              ).map(([gameKey, _]) => ({ name: GAME_NAMES[gameKey] }))
            : ORDERED_PROPER_GAMES.map((gameKey) => ({
                name: GAME_NAMES[gameKey],
              }))
        );
      case "WithoutDifficulty":
        return stringify(
          showFilters || randomizeGroupings
            ? createPastaWithoutDifficulty(
                metadata.pasta,
                showFilters ? checkState : null
              )
            : metadata.pasta
        );
      case "WithDifficulty":
        if (showFilters) {
          if (customizedPasta != null) {
            return stringify(customizedPasta);
          } else {
            throw new Error("customizedPasta expected to be nonnull");
          }
        }
        return stringify(
          randomizeGroupings
            ? createPasta(
                metadata.pasta,
                getDefaultDifficulties(metadata.pasta)
              )
            : metadata.pasta
        );
      case "Other":
        return stringify(metadata.pasta);
    }
  };

  return (
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
      {(metadata.type === "WithDifficulty" ||
        metadata.type === "WithoutDifficulty" ||
        variant === "Game Names") && (
        <Group>
          {variant !== "Game Names" && (
            <Tooltip
              label={
                <span>
                  Games will be divided into groups randomly while still
                  respecting the
                  <br />
                  difficulty distribution, allowing for greater card variety
                  than using the
                  <br />
                  default pasta. This option is always enabled when customizing
                  games and
                  <br />
                  difficulty counts.
                </span>
              }
            >
              <div>
                <Checkbox
                  checked={showFilters || randomizeGroupings}
                  label="Randomize goal groupings"
                  onChange={(event) =>
                    setRandomizeGroupings(event.currentTarget.checked)
                  }
                />
              </div>
            </Tooltip>
          )}
          <Checkbox
            checked={showFilters}
            label={
              metadata.type === "WithDifficulty"
                ? "Customize games and difficulty counts"
                : "Customize games"
            }
            onChange={(event) => setShowFilters(event.currentTarget.checked)}
          />
        </Group>
      )}
      {(metadata.type === "WithoutDifficulty" || variant === "Game Names") &&
        showFilters && (
          <GameChecker checkState={checkState} setCheckState={setCheckState} />
        )}
      {variant === "Game Names" && showFilters && hasLessThan25Games && (
        <Alert
          variant="light"
          color="red"
          title="Error: You must select at least 25 games"
        />
      )}
      {metadata.type === "WithDifficulty" && showFilters && (
        <PastaFilter
          key={variant}
          checkState={checkState}
          setCheckState={setCheckState}
          pasta={metadata.pasta}
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
        <Tooltip
          label={
            isLockout ? (
              <span>
                Stats about public games will be visible to all users on the
                Matches tab.
                <br />
                Users will still need the password to join the Bingosync room.
              </span>
            ) : (
              <span>Only Lockout games can be made Public.</span>
            )
          }
        >
          <div>
            <Checkbox
              checked={isPublic}
              disabled={!isLockout}
              label="Public"
              onChange={(event) => setIsPublicRaw(event.currentTarget.checked)}
            />
          </div>
        </Tooltip>
      </Group>
      <Button
        disabled={
          isCreationInProgress ||
          roomName === "" ||
          password === "" ||
          (variant === "Game Names" && showFilters && hasLessThan25Games) ||
          (variant === "Custom" && custom === "") ||
          (metadata.type === "WithDifficulty" &&
            showFilters &&
            customizedPasta == null)
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
                ["Standard", "Spicy", "Nozzlo", "Blitz", "Game Names"].includes(
                  variant
                ),
              isLockout,
              pasta: getSerializedPasta(false),
              leagueInfo: null,
            });
            const id = url.slice(ROOM_PREFIX.length);
            db.createdMatches.add({ id });
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
        disabled={
          metadata.type === "WithDifficulty" &&
          showFilters &&
          customizedPasta == null
        }
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
          .
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
