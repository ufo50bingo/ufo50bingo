"use client";

import { useMemo, useState } from "react";
import { IconCheck, IconDots, IconExclamationMark } from "@tabler/icons-react";
import {
  ActionIcon,
  Alert,
  Button,
  Checkbox,
  Group,
  JsonInput,
  SegmentedControl,
  Select,
  Stack,
  Text,
  Textarea,
  TextInput,
  Tooltip,
} from "@mantine/core";
import GameChecker from "./GameChecker";
import { Game, GAME_NAMES, ORDERED_PROPER_GAMES } from "../goals";
import { METADATA, Variant, VariantMetadata } from "../pastas/metadata";
import VariantHoverCard from "./VariantHoverCard";
import createMatch from "./createMatch";
import { db } from "../db";
import Link from "next/link";
import ufoGenerator, {
  Counts,
  UFODifficulties,
  UFOGameGoals,
  UFOPasta,
} from "../generator/ufoGenerator";
import UFODifficultySelectors from "./UFODifficultySelectors";
import UFODraftCreator from "./UFODraftCreator";
import validateUfo from "../generator/validateUfo";
import useLocalEnum from "../localStorage/useLocalEnum";
import { CheckerSort } from "./CheckerSortSelector";

const options: ReadonlyArray<VariantMetadata> = METADATA.filter(
  (d) => !d.isMenu
);
const menuOptions: ReadonlyArray<VariantMetadata> = METADATA.filter(
  (d) => d.isMenu
);

type CustomType = "srl_v5" | "ufo" | "fixed_board" | "randomized";

export default function NonLeagueMatch() {
  const [showAll, setShowAll] = useState(false);
  const [checkerSort, setCheckerSortRaw] = useLocalEnum({
    key: "checker-sort",
    defaultValue: "chronological",
    options: ["chronological", "alphabetical"],
  });
  const [variant, setVariant] = useState<Variant>(options[0].name);
  const [custom, setCustom] = useState("");
  const [checkState, setCheckState] = useState<Map<Game, boolean>>(
    new Map(
      (checkerSort === "chronological"
        ? ORDERED_PROPER_GAMES
        : ORDERED_PROPER_GAMES.toSorted()
      ).map((key) => [key, true])
    )
  );
  const [numPlayers, setNumPlayers] = useState(2);
  const [draftCheckState, setDraftCheckState] = useState<
    Map<Game, null | number>
  >(
    new Map(
      (checkerSort === "chronological"
        ? ORDERED_PROPER_GAMES
        : ORDERED_PROPER_GAMES.toSorted()
      ).map((key) => [key, null])
    )
  );

  const setCheckerSort = (newSort: CheckerSort) => {
    setCheckerSortRaw(newSort);
    setCheckState(
      new Map(
        (newSort === "chronological"
          ? ORDERED_PROPER_GAMES
          : ORDERED_PROPER_GAMES.toSorted()
        ).map((key) => [key, checkState.get(key) ?? true])
      )
    );
    setDraftCheckState(
      new Map(
        (newSort === "chronological"
          ? ORDERED_PROPER_GAMES
          : ORDERED_PROPER_GAMES.toSorted()
        ).map((key) => [key, draftCheckState.get(key) ?? null])
      )
    );
  };

  const [draftPasta, setDraftPasta] = useState<null | UFOPasta>(null);
  const [showFilters, setShowFilters] = useState(false);

  const [roomName, setRoomName] = useState("");
  const [password, setPassword] = useState("");
  const [isLockout, setIsLockout] = useState(true);
  const [isPublicRaw, setIsPublicRaw] = useState(true);
  const [isCreationInProgress, setIsCreationInProgress] = useState(false);
  const [url, setUrl] = useState("");
  const [id, setId] = useState<null | string>(null);
  const [error, setError] = useState<Error | null>(null);
  const [customType, setCustomType] = useState<CustomType>("ufo");

  const [difficultyCounts, setDifficultyCounts] = useState(() => {
    const counts: { [name: string]: Counts } = {};
    METADATA.forEach((data) => {
      if (data.type !== "UFO") {
        return;
      }
      counts[data.name] = data.pasta.category_counts;
    });
    return counts;
  });

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
    const stringify = (structured: ReadonlyArray<{ name: string }>) =>
      pretty ? JSON.stringify(structured, null, 2) : JSON.stringify(structured);
    switch (metadata.type) {
      case "Custom":
        return customType === "ufo" && customUfo != null
          ? stringify(ufoGenerator(customUfo).map((goal) => ({ name: goal })))
          : custom;
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
      case "UFODraft":
        if (draftPasta != null) {
          return stringify(
            ufoGenerator(draftPasta).map((goal) => ({ name: goal }))
          );
        } else {
          throw new Error("draftPasta expected to be nonnull");
        }
      case "UFO":
        if (!showFilters) {
          return stringify(
            ufoGenerator(metadata.pasta).map((goal) => ({ name: goal }))
          );
        }
        // we check for excluded games instead of included
        // so we don't accidentally remove generals
        const difficultyToGameToGoals = metadata.pasta.goals;
        const filtered: UFODifficulties = {};
        Object.keys(difficultyToGameToGoals).forEach((difficulty) => {
          const gameToGoals = difficultyToGameToGoals[difficulty];
          const newGameToGoals: UFOGameGoals = {};
          Object.keys(gameToGoals).forEach((game) => {
            // game isn't actually guaranteed to be type Game,
            // but that's ok
            if (checkState.get(game as Game) !== false) {
              newGameToGoals[game] = gameToGoals[game];
            }
          });
          filtered[difficulty] = newGameToGoals;
        });
        return stringify(
          ufoGenerator({
            ...metadata.pasta,
            goals: filtered,
            category_counts: difficultyCounts[metadata.name],
          }).map((goal) => ({ name: goal }))
        );
    }
  };

  const { customUfo, customUfoErrors, customUfoWarnings } = useMemo(() => {
    if (customType !== "ufo" || custom === "") {
      return { customUfo: null, customUfoErrors: [], customUfoWarnings: [] };
    }
    const result = validateUfo(custom);
    return {
      customUfo: result.pasta,
      customUfoErrors: result.errors,
      customUfoWarnings: result.warnings,
    };
  }, [customType, custom]);

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
        {!showAll && (
          <ActionIcon onClick={() => setShowAll(true)} variant="default">
            <IconDots size={16} />
          </ActionIcon>
        )}
      </Group>
      {showAll && (
        <SegmentedControl
          style={{ flexGrow: 1 }}
          data={menuOptions.map((option) => ({
            value: option.name,
            label: <VariantHoverCard metadata={option} />,
          }))}
          fullWidth={true}
          onChange={setVariant as unknown as (value: string) => void}
          value={variant}
        />
      )}
      <Group justify="space-between">
        {((metadata.type === "UFO" && metadata.isGeneric !== true) ||
          metadata.type === "GameNames") && (
          <Checkbox
            checked={showFilters}
            label="Customize"
            onChange={(event) => setShowFilters(event.currentTarget.checked)}
          />
        )}
        {metadata.type === "UFO" && (
          <Tooltip label="Copy the source in the new “UFO” format.">
            <Button
              variant="light"
              size="xs"
              onClick={() => {
                navigator.clipboard.writeText(
                  JSON.stringify(metadata.pasta, null, 2)
                );
              }}
            >
              Copy source
            </Button>
          </Tooltip>
        )}
      </Group>
      {(metadata.type === "GameNames" ||
        (metadata.type === "UFO" && metadata.isGeneric !== true)) &&
        showFilters && (
          <GameChecker
            checkState={checkState}
            setCheckState={setCheckState}
            sort={checkerSort}
            setSort={setCheckerSort}
          />
        )}
      {metadata.type === "GameNames" && showFilters && hasLessThan25Games && (
        <Alert
          variant="light"
          color="red"
          title="Error: You must select at least 25 games"
        />
      )}
      {metadata.type === "UFO" &&
        metadata.isGeneric !== true &&
        showFilters && (
          <UFODifficultySelectors
            goals={metadata.pasta.goals}
            checkState={checkState}
            counts={difficultyCounts[metadata.name]}
            setCounts={(newCounts) => {
              setDifficultyCounts({
                ...difficultyCounts,
                [metadata.name]: newCounts,
              });
            }}
          />
        )}
      {metadata.type === "UFODraft" && (
        <UFODraftCreator
          draftCheckState={draftCheckState}
          setDraftCheckState={setDraftCheckState}
          numPlayers={numPlayers}
          setNumPlayers={setNumPlayers}
          pasta={metadata.pasta}
          onChangePasta={setDraftPasta}
          sort={checkerSort}
          setSort={setCheckerSort}
        />
      )}
      {metadata.type === "Custom" && (
        <Stack>
          <Select
            data={[
              { value: "srl_v5", label: "SRL v5" },
              { value: "ufo", label: "UFO" },
              { value: "fixed_board", label: "Fixed Board" },
              { value: "randomized", label: "Randomized" },
            ]}
            label="Custom Type"
            value={customType}
            onChange={(newValue) => setCustomType(newValue as CustomType)}
          />
          {customType === "ufo" ? (
            <>
              <Textarea
                autosize
                label="Add your pasta here:"
                maxRows={12}
                minRows={2}
                onChange={(event) => setCustom(event.currentTarget.value)}
                spellCheck={false}
                value={custom}
                data-monospace
              />
              {customUfoErrors.length > 0 && (
                <Alert
                  color="red"
                  style={{ whiteSpace: "pre-line" }}
                  title="Error: Pasta format is incorrect"
                >
                  {customUfoErrors.join("\n")}
                </Alert>
              )}
              {customUfoWarnings.length > 0 && (
                <Alert
                  color="yellow"
                  style={{ whiteSpace: "pre-line" }}
                  title="Warning: Pasta may have mistakes"
                >
                  {customUfoWarnings.join("\n")}
                </Alert>
              )}
            </>
          ) : (
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
        </Stack>
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
          (metadata.type === "GameNames" &&
            showFilters &&
            hasLessThan25Games) ||
          (metadata.type === "Custom" && custom === "") ||
          (metadata.type === "Custom" &&
            customType === "ufo" &&
            customUfo == null)
        }
        onClick={async () => {
          setIsCreationInProgress(true);

          try {
            const id = await createMatch({
              roomName,
              password,
              isPublic,
              variant,
              bingosyncVariant:
                metadata.type === "UFO" ||
                (metadata.type === "Custom" &&
                  (customType === "fixed_board" || customType === "ufo"))
                  ? "18"
                  : metadata.type === "GameNames" ||
                    (metadata.type === "Custom" && customType === "randomized")
                  ? "172"
                  : "187",
              isCustom:
                showFilters &&
                (metadata.type === "GameNames" || metadata.type === "UFO"),
              isLockout,
              pasta: getSerializedPasta(false),
              leagueInfo: null,
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
      <Button
        disabled={
          metadata.type === "Custom" &&
          customType === "ufo" &&
          customUfo == null
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
