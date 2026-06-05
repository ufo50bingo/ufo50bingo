"use client";

import { useMemo, useState } from "react";
import { IconCheck, IconDots, IconExclamationMark } from "@tabler/icons-react";
import {
  ActionIcon,
  Alert,
  Anchor,
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
import { METADATA, Variant, VariantMetadata } from "../pastas/metadata";
import VariantHoverCard from "./VariantHoverCard";
import createMatch from "./createMatch";
import { db } from "../db";
import Link from "next/link";
import ufoGenerator, {
  Counts,
  UFODifficulties,
  UFODraftPasta,
  UFOGameGoals,
  UFOPasta,
} from "../generator/ufoGenerator";
import UFODifficultySelectors from "./UFODifficultySelectors";
import UFODraftCreator from "./UFODraftCreator";
import useLocalEnum from "../localStorage/useLocalEnum";
import validateStr from "../generator/validateStr";

const options: ReadonlyArray<VariantMetadata> = METADATA.filter(
  (d) => !d.isMenu,
);
const menuOptions: ReadonlyArray<VariantMetadata> = METADATA.filter(
  (d) => d.isMenu,
);

type CustomType = "srl_v5" | "ufo" | "fixed_board" | "randomized";

export default function NonLeagueMatch() {
  const [showAll, setShowAll] = useState(false);
  const [checkerSort, setCheckerSort] = useLocalEnum({
    key: "checker-sort",
    defaultValue: "chronological",
    options: ["chronological", "alphabetical"],
  });
  const [variant, setVariant] = useState<Variant>(options[0].name);
  const [custom, setCustom] = useState("");
  const [uncheckedGames, setUncheckedGames] = useState<Set<string>>(new Set());
  const [numPlayers, setNumPlayers] = useState(2);
  const [draftCheckState, setDraftCheckState] = useState<Map<string, number>>(
    new Map(),
  );

  const [draftPasta, setDraftPasta] = useState<null | UFODraftPasta>(null);
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

  const [difficultyCounts, setDifficultyCounts] = useState<{
    [name: string]: Counts;
  }>({});

  const isPublic = isPublicRaw && isLockout;
  const metadata = METADATA.find((d) => d.name === variant)!;

  const getSerializedPasta = (pretty: boolean): string => {
    const stringify = (structured: ReadonlyArray<{ name: string }>) =>
      pretty ? JSON.stringify(structured, null, 2) : JSON.stringify(structured);
    const getUFOPastaWithCustomSelectors = (pasta: UFOPasta): string => {
      if (!showFilters) {
        return stringify(ufoGenerator(pasta).map((goal) => ({ name: goal })));
      }
      // we check for excluded games instead of included
      // so we don't accidentally remove generals
      const difficultyToGameToGoals = pasta.goals;
      const filtered: UFODifficulties = {};
      Object.keys(difficultyToGameToGoals).forEach((difficulty) => {
        const gameToGoals = difficultyToGameToGoals[difficulty];
        const newGameToGoals: UFOGameGoals = {};
        Object.keys(gameToGoals).forEach((game) => {
          if (!uncheckedGames.has(game)) {
            newGameToGoals[game] = gameToGoals[game];
          }
        });
        filtered[difficulty] = newGameToGoals;
      });
      return stringify(
        ufoGenerator({
          ...pasta,
          goals: filtered,
          category_counts:
            difficultyCounts[metadata.name] ??
            (metadata.type === "Custom"
              ? customUfo!.category_counts
              : metadata.pasta.category_counts),
        }).map((goal) => ({ name: goal })),
      );
    };
    switch (metadata.type) {
      case "Custom":
        return customType === "ufo" && customUfo != null
          ? getUFOPastaWithCustomSelectors(customUfo)
          : custom;
      case "UFODraft":
        if (draftPasta != null) {
          return stringify(
            ufoGenerator(draftPasta).map((goal) => ({ name: goal })),
          );
        } else {
          throw new Error("draftPasta expected to be nonnull");
        }
      case "UFO":
        return getUFOPastaWithCustomSelectors(metadata.pasta);
    }
  };

  const { customUfo, customUfoErrors, customUfoWarnings } = useMemo(() => {
    if (customType !== "ufo" || custom === "") {
      return { customUfo: null, customUfoErrors: [], customUfoWarnings: [] };
    }
    const result = validateStr(custom);
    return {
      customUfo: result.pasta,
      customUfoErrors: result.errors,
      customUfoWarnings: result.warnings,
    };
  }, [customType, custom]);

  const resetCustomDifficultyCounts = () => {
    setDifficultyCounts((prevDifficultyCounts) => {
      const newDifficultyCounts = { ...prevDifficultyCounts };
      delete newDifficultyCounts["Custom"];
      return newDifficultyCounts;
    });
  };

  return (
    <Stack gap={8}>
      <Text>
        <strong>Choose variant</strong>
      </Text>
      <Group gap="sm">
        <SegmentedControl
          style={{ flexGrow: 1 }}
          styles={{ root: { flexWrap: "wrap", display: "flex" } }}
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
          styles={{ root: { flexWrap: "wrap", display: "flex" } }}
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
        {metadata.type === "UFO" && (
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
                  JSON.stringify(metadata.pasta, null, 2),
                );
              }}
            >
              Copy source
            </Button>
          </Tooltip>
        )}
      </Group>
      {metadata.type === "Custom" && (
        <Stack>
          <Stack gap={4}>
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
            {customType === "ufo" && (
              <Anchor
                size="xs"
                target="_blank"
                href="https://docs.google.com/document/d/1af04BI8p1-_FtcO8iRHiyrsNlsiqSormkYEJn-4DlLk/edit?tab=t.0"
              >
                View the specification for the UFO format here.
              </Anchor>
            )}
          </Stack>

          {customType === "ufo" ? (
            <>
              <Textarea
                autosize
                label="Add your pasta here:"
                maxRows={12}
                minRows={2}
                onChange={(event) => {
                  resetCustomDifficultyCounts();
                  setCustom(event.currentTarget.value);
                }}
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
              {customUfo != null && (
                <Checkbox
                  checked={showFilters}
                  label="Customize"
                  onChange={(event) =>
                    setShowFilters(event.currentTarget.checked)
                  }
                />
              )}
            </>
          ) : (
            <JsonInput
              autosize
              label="Add your pasta here:"
              maxRows={12}
              minRows={2}
              onChange={(value) => {
                setCustom(value);
                resetCustomDifficultyCounts();
              }}
              spellCheck={false}
              validationError="Invalid JSON"
              value={custom}
            />
          )}
        </Stack>
      )}
      {(metadata.type === "UFO" ||
        (metadata.type === "Custom" && customUfo != null)) &&
        showFilters && (
          <>
            <GameChecker
              uncheckedGames={uncheckedGames}
              setUncheckedGames={setUncheckedGames}
              sort={checkerSort}
              setSort={setCheckerSort}
              ufoDifficulties={
                metadata.type === "Custom"
                  ? customUfo!.goals
                  : metadata.pasta.goals
              }
            />
            <UFODifficultySelectors
              goals={
                metadata.type === "Custom"
                  ? customUfo!.goals
                  : metadata.pasta.goals
              }
              uncheckedGames={uncheckedGames}
              counts={
                difficultyCounts[metadata.name] ??
                (metadata.type === "Custom"
                  ? customUfo!.category_counts
                  : metadata.pasta.category_counts)
              }
              setCounts={(newCounts) => {
                setDifficultyCounts({
                  ...difficultyCounts,
                  [metadata.name]: newCounts,
                });
              }}
            />
          </>
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
          (metadata.type === "Custom" && custom === "") ||
          (metadata.type === "Custom" &&
            customType === "ufo" &&
            customUfo == null) ||
          (metadata.type === "UFODraft" && draftPasta == null)
        }
        onClick={async () => {
          setIsCreationInProgress(true);

          try {
            let bingosyncVariant;
            switch (metadata.type) {
              case "UFO":
              case "UFODraft":
                bingosyncVariant = "18";
                break;
              case "Custom":
                switch (customType) {
                  case "srl_v5":
                    bingosyncVariant = "187";
                    break;
                  case "ufo":
                  case "fixed_board":
                    bingosyncVariant = "18";
                    break;
                  case "randomized":
                    bingosyncVariant = "172";
                    break;
                }
                break;
            }
            const id = await createMatch({
              roomName,
              password,
              isPublic,
              variant,
              bingosyncVariant,
              isCustom: showFilters && metadata.type === "UFO",
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
          (metadata.type === "Custom" &&
            customType === "ufo" &&
            customUfo == null) ||
          (metadata.type === "UFODraft" && draftPasta == null)
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
          <Link prefetch={false} href={`/match/${id}`} target="_blank">
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
