"use client";

import { useCallback, useMemo, useState } from "react";
import { IconCheck, IconExclamationMark } from "@tabler/icons-react";
import {
  Alert,
  Anchor,
  Button,
  Card,
  Checkbox,
  Chip,
  Group,
  List,
  Select,
  Stack,
  Text,
  Textarea,
  TextInput,
  Tooltip,
} from "@mantine/core";
import GameChecker from "./GameChecker";
import { METADATA, SELECTOR_DATA, Variant } from "../pastas/metadata";
import createMatch from "./createMatch";
import { db } from "../db";
import Link from "next/link";
import ufoGenerator, { Counts, UFOPasta } from "../generator/ufoGenerator";
import UFODifficultySelectors from "./UFODifficultySelectors";
import UFODraftCreator from "./UFODraftCreator";
import useLocalEnum from "../localStorage/useLocalEnum";
import validateStr from "../generator/validateStr";
import getFilteredDifficulties from "./getFilteredDifficulties";
import FiltersModal, { FilterInfo } from "./FiltersModal";
import { getRoomLink } from "../roomApi";
import ufoDoubleGenerator from "../generator/ufoDoubleGenerator";
import findGoal from "../findGoal";
import { authClient } from "../authClient";
import BoardSizeSelectors from "./BoardSizeSelectors";

type CustomType = "ufo" | "fixed_board";

const FORMAT_OPTIONS = ["Normal", "Draft", "Custom", "Double"] as const;
type Format = (typeof FORMAT_OPTIONS)[number];

type Props = {
  visible: boolean;
};

const DEFAULT_FILTER_INFO: FilterInfo = {
  selectedIds: new Set(),
  excludedGames: new Set(),
};

export type BoardSize = {
  rows: number;
  cols: number;
  lockSquare: boolean;
};

export default function NonLeagueMatch({ visible }: Props) {
  const { data: session, isPending } = authClient.useSession();
  const [isFilterModalShown, setIsFilterModalShown] = useState(false);
  const [checkerSort, setCheckerSort] = useLocalEnum({
    key: "checker-sort",
    defaultValue: "chronological",
    options: ["chronological", "alphabetical"],
  });
  const [variant, setVariant] = useState<Variant>(METADATA[0].name);
  const [custom, setCustom] = useState("");
  const [fixedBoard, setFixedBoard] = useState("");
  const [uncheckedGames, setUncheckedGames] = useState<Set<string>>(new Set());
  const [numPlayers, setNumPlayers] = useState(2);
  const [draftCheckState, setDraftCheckState] = useState<Map<string, number>>(
    new Map(),
  );

  const [draftPasta, setDraftPasta] = useState<null | UFOPasta>(null);
  const [rawFormat, setFormat] = useState<Format>("Normal");
  const [allFilterInfo, setAllFilterInfo] = useState<
    ReadonlyMap<string, FilterInfo>
  >(new Map());

  const filterInfo = allFilterInfo.get(variant) ?? DEFAULT_FILTER_INFO;
  const setFilterInfo = useCallback(
    (newFilterInfo: FilterInfo) => {
      setAllFilterInfo((prevAllFilterInfo) => {
        const newMap = new Map(prevAllFilterInfo.entries());
        newMap.set(variant, newFilterInfo);
        return newMap;
      });
    },
    [variant],
  );

  const [roomName, setRoomName] = useState("");
  const [password, setPassword] = useState("");
  const [isLockout, setIsLockout] = useState(true);
  const [isPublicRaw, setIsPublicRaw] = useState(true);
  const [isCreationInProgress, setIsCreationInProgress] = useState(false);
  const [createdPassword, setCreatedPassword] = useState("");
  const [createdIds, setCreatedIds] = useState<ReadonlyArray<string>>([]);
  const [error, setError] = useState<Error | null>(null);
  const [customType, setCustomType] = useState<CustomType>("ufo");

  const [boardSize, setBoardSizeRaw] = useState<BoardSize>({
    rows: 5,
    cols: 5,
    lockSquare: true,
  });
  const [difficultyCounts, setDifficultyCounts] = useState<{
    [name: string]: Counts;
  }>({});
  const setBoardSize = useCallback((newBoardSize: BoardSize) => {
    setBoardSizeRaw((prevBoardSize: BoardSize) => {
      if (
        prevBoardSize.rows !== newBoardSize.rows ||
        prevBoardSize.cols !== newBoardSize.cols
      ) {
        setDifficultyCounts({});
      }
      return newBoardSize;
    });
  }, []);

  const isPublic = isPublicRaw && isLockout;
  const metadata = METADATA.find((d) => d.name === variant)!;

  const format = metadata.name === "10 Cherry Race" ? "Custom" : rawFormat;

  const getSerializedPasta = (): ReadonlyArray<string> => {
    const getUFOPastaWithCustomSelectors = (
      pasta: UFOPasta,
    ): ReadonlyArray<string> => {
      if (format !== "Custom" && !metadata.hasFilters) {
        return ufoGenerator(pasta, 5, 5);
      }
      const finalUncheckedGames =
        metadata.hasFilters && format === "Custom"
          ? uncheckedGames.union(filterInfo.excludedGames)
          : format === "Custom"
            ? uncheckedGames
            : filterInfo.excludedGames;
      const rowsToUse = format === "Custom" ? boardSize.rows : 5;
      const colsToUse = format === "Custom" ? boardSize.cols : 5;
      let goals = ufoGenerator(
        {
          ...pasta,
          goals: getFilteredDifficulties(pasta.goals, finalUncheckedGames),
          category_counts:
            format === "Custom"
              ? (difficultyCounts[metadata.name] ??
                getDefaultDifficultyCounts(pasta, rowsToUse, colsToUse))
              : pasta.category_counts,
        },
        rowsToUse,
        colsToUse,
      );
      if (metadata.name === "10 Cherry Race") {
        goals = goals.toSorted();
      }
      return goals;
    };
    switch (metadata.type) {
      case "Custom":
        if (customType === "fixed_board") {
          return fixedBoard.trim().split("\n");
        }
        if (customUfo == null) {
          throw new Error("Pasta has errors!");
        }
        if (format === "Draft") {
          if (draftPasta != null) {
            return ufoGenerator(draftPasta, 5, 5);
          } else {
            throw new Error("draftPasta expected to be nonnull");
          }
        }
        return getUFOPastaWithCustomSelectors(customUfo);

      case "UFO":
        if (format === "Draft") {
          if (draftPasta != null) {
            return ufoGenerator(draftPasta, 5, 5);
          } else {
            throw new Error("draftPasta expected to be nonnull");
          }
        }
        return getUFOPastaWithCustomSelectors(metadata.pasta);
    }
  };

  const { customUfo, customUfoErrors, customUfoWarnings } = useMemo(() => {
    if (custom === "") {
      return { customUfo: null, customUfoErrors: [], customUfoWarnings: [] };
    }
    const result = validateStr(custom);
    return {
      customUfo: result.pasta,
      customUfoErrors: result.errors,
      customUfoWarnings: result.warnings,
    };
  }, [custom]);

  const fixedBoardMissing = useMemo(() => {
    if (customType !== "fixed_board" || customUfo == null) {
      return [];
    }
    const goals = fixedBoard.trim().split("\n");
    return goals.filter((g) => findGoal(g, customUfo) == null);
  }, [customType, customUfo, fixedBoard]);

  const resetCustomDifficultyCounts = () => {
    setDifficultyCounts((prevDifficultyCounts) => {
      const newDifficultyCounts = { ...prevDifficultyCounts };
      delete newDifficultyCounts["Custom"];
      return newDifficultyCounts;
    });
  };

  if (!visible) {
    return null;
  }

  return (
    <>
      <Card.Section withBorder={true} inheritPadding={true} py="xs">
        <Stack gap={8}>
          {!isPending && session == null && (
            <Alert color="yellow">
              Please sign in from the bottom of the left sidebar before creating
              a match.
            </Alert>
          )}
          <Text>
            <strong>Choose variant</strong>
          </Text>
          <Select
            value={variant}
            onChange={(newVariant: string | null) =>
              setVariant(newVariant as Variant)
            }
            data={SELECTOR_DATA}
            allowDeselect={false}
            searchable={true}
            clearable={false}
          />
          <Text size="sm">{metadata.info}</Text>
          {metadata.type === "Custom" && (
            <>
              <Stack gap={4}>
                <Select
                  data={[
                    { value: "ufo", label: "UFO" },
                    { value: "fixed_board", label: "Fixed Board" },
                  ]}
                  label="Custom Type"
                  value={customType}
                  onChange={(newValue) => setCustomType(newValue as CustomType)}
                />
              </Stack>
              {customType === "fixed_board" && (
                <Textarea
                  autosize
                  label="Add goals here, one per line"
                  maxRows={12}
                  minRows={2}
                  onChange={(event) => {
                    setFixedBoard(event.target.value);
                  }}
                  spellCheck={false}
                  value={fixedBoard}
                />
              )}
              {fixedBoard.trim() !== "" && fixedBoardMissing.length > 0 && (
                <Alert
                  color="yellow"
                  style={{ whiteSpace: "pre-line" }}
                  title="These goals are missing from your full pasta:"
                >
                  {fixedBoardMissing.join("\n")}
                </Alert>
              )}
              {customType === "fixed_board" &&
                fixedBoard.trim() !== "" &&
                fixedBoard.trim().split("\n").length !== 25 && (
                  <Alert
                    color="red"
                    style={{ whiteSpace: "pre-line" }}
                    title="Error: You must provide exactly 25 goals for a fixed board"
                  >
                    You have provided {fixedBoard.trim().split("\n").length}.
                  </Alert>
                )}
              <Textarea
                autosize
                label={
                  customType === "fixed_board"
                    ? "Optional - Add a full pasta to enable features like short text and trackers:"
                    : "Add your pasta here:"
                }
                maxRows={12}
                minRows={2}
                onChange={(event) => {
                  resetCustomDifficultyCounts();
                  setFilterInfo(DEFAULT_FILTER_INFO);
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
              <Anchor
                size="xs"
                target="_blank"
                href="https://docs.google.com/document/d/1af04BI8p1-_FtcO8iRHiyrsNlsiqSormkYEJn-4DlLk/edit?tab=t.0"
              >
                View the specification for the UFO format here.
              </Anchor>
            </>
          )}
          <Group justify="space-between">
            {(metadata.type === "UFO" ||
              (metadata.type === "Custom" &&
                customUfo != null &&
                customType === "ufo")) &&
              metadata.name !== "10 Cherry Race" && (
                <Chip.Group
                  multiple={false}
                  value={format}
                  onChange={(newFormat: string) =>
                    setFormat(newFormat as Format)
                  }
                >
                  <Group gap={8}>
                    {FORMAT_OPTIONS.map((f) => (
                      <Chip key={f} value={f}>
                        {f}
                      </Chip>
                    ))}
                  </Group>
                </Chip.Group>
              )}
            <Group gap={8}>
              {(metadata.type === "UFO" ||
                (metadata.type === "Custom" && customUfo != null)) &&
                metadata.hasFilters && (
                  <Button
                    variant="light"
                    size="xs"
                    onClick={() => setIsFilterModalShown(true)}
                  >
                    Filters
                  </Button>
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
          </Group>
        </Stack>
      </Card.Section>
      {(metadata.type === "UFO" ||
        (metadata.type === "Custom" && customUfo != null)) &&
        (format === "Custom" || format === "Draft") && (
          <Card.Section withBorder={true} inheritPadding={true} py="xs">
            <Stack gap={8}>
              {format === "Custom" && (
                <>
                  <GameChecker
                    canSort={true}
                    uncheckedGames={uncheckedGames}
                    setUncheckedGames={setUncheckedGames}
                    sort={checkerSort}
                    setSort={setCheckerSort}
                    pasta={
                      metadata.type === "Custom" ? customUfo! : metadata.pasta
                    }
                    excludedGames={
                      metadata.hasFilters ? filterInfo.excludedGames : undefined
                    }
                  />
                  <BoardSizeSelectors
                    boardSize={boardSize}
                    setBoardSize={setBoardSize}
                  />
                  <UFODifficultySelectors
                    goals={
                      metadata.type === "Custom"
                        ? customUfo!.goals
                        : metadata.pasta.goals
                    }
                    uncheckedGames={uncheckedGames}
                    excludedGames={
                      metadata.hasFilters ? filterInfo.excludedGames : undefined
                    }
                    counts={
                      difficultyCounts[metadata.name] ??
                      getDefaultDifficultyCounts(
                        metadata.type === "Custom"
                          ? customUfo!
                          : metadata.pasta,
                        boardSize.rows,
                        boardSize.cols,
                      )
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
              {format === "Draft" && (
                <UFODraftCreator
                  draftCheckState={draftCheckState}
                  setDraftCheckState={setDraftCheckState}
                  numPlayers={numPlayers}
                  setNumPlayers={setNumPlayers}
                  pasta={
                    metadata.type === "Custom" ? customUfo! : metadata.pasta
                  }
                  onChangePasta={setDraftPasta}
                  sort={checkerSort}
                  setSort={setCheckerSort}
                  excludedGames={
                    metadata.hasFilters ? filterInfo.excludedGames : undefined
                  }
                />
              )}
            </Stack>
          </Card.Section>
        )}
      <Card.Section withBorder={true} inheritPadding={true} py="xs">
        <Stack gap={8}>
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
                    Users will still need the password to join the Bingosync
                    room.
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
                  onChange={(event) =>
                    setIsPublicRaw(event.currentTarget.checked)
                  }
                />
              </div>
            </Tooltip>
          </Group>
        </Stack>
      </Card.Section>
      <Card.Section withBorder={true} inheritPadding={true} py="xs">
        <Stack gap={8}>
          <Button
            disabled={
              isPending ||
              session == null ||
              isCreationInProgress ||
              roomName === "" ||
              password === "" ||
              (metadata.type === "Custom" && custom === "") ||
              (metadata.type === "Custom" &&
                customType === "ufo" &&
                customUfo == null) ||
              (metadata.type === "UFO" &&
                format === "Draft" &&
                draftPasta == null)
            }
            onClick={async () => {
              try {
                setIsCreationInProgress(true);

                const pasta =
                  metadata.type === "Custom" ? customUfo! : metadata.pasta;

                const promises: Array<Promise<string>> = [];
                if (
                  format === "Double" &&
                  (metadata.type === "UFO" ||
                    (metadata.type === "Custom" && customUfo != null))
                ) {
                  const common = {
                    password,
                    isPublic,
                    variant,
                    isCustom: true,
                    isDraft: false,
                    isLockout,
                    leagueInfo: null,
                    fullPasta: metadata.type === "Custom" ? customUfo : null,
                  };
                  const [card1, card2] = ufoDoubleGenerator(pasta);
                  promises.push(
                    createMatch({
                      ...common,
                      roomName: roomName + " — Card 1",
                      goals: card1,
                    }),
                  );
                  promises.push(
                    createMatch({
                      ...common,
                      roomName: roomName + " — Card 2",
                      goals: card2,
                    }),
                  );
                } else {
                  promises.push(
                    createMatch({
                      roomName,
                      password,
                      isPublic,
                      variant,
                      isCustom:
                        format === "Custom" &&
                        (metadata.type === "UFO" ||
                          (metadata.type === "Custom" && customUfo != null)),
                      isDraft:
                        format === "Draft" &&
                        (metadata.type === "UFO" ||
                          (metadata.type === "Custom" && customUfo != null)),
                      isLockout,
                      goals: getSerializedPasta(),
                      fullPasta: metadata.type === "Custom" ? customUfo : null,
                      leagueInfo: null,
                    }),
                  );
                }

                const ids = await Promise.all(promises);
                db.createdMatches.bulkAdd(ids.map((id) => ({ id })));
                setError(null);
                setCreatedIds(ids);
                setIsCreationInProgress(false);
                setCreatedPassword(password);

                if (format !== "Double") {
                  window.open(getRoomLink(ids[0], password), "_blank");
                }
              } catch (err: unknown) {
                setIsCreationInProgress(false);
                setCreatedIds([]);
                setCreatedPassword("");
                if (err instanceof Error) {
                  setError(err);
                } else {
                  setError(new Error("unknown error!"));
                }
              }
            }}
            color="green"
          >
            Create Room
            {format === "Double" &&
            (metadata.type === "UFO" ||
              (metadata.type === "Custom" && customUfo != null))
              ? "s"
              : ""}
          </Button>
          <Button
            disabled={
              (metadata.type === "Custom" &&
                customType === "ufo" &&
                customUfo == null) ||
              (metadata.type === "UFO" &&
                format === "Draft" &&
                draftPasta == null) ||
              format === "Double"
            }
            onClick={() => {
              navigator.clipboard.writeText(getSerializedPasta().join("\n"));
              // const row1Difficulties = [0, 0, 0, 0, 0];
              // const diagDifficulties = [0, 0, 0, 0, 0];
              // const trials = 10000;
              // for (let i = 0; i < 10000; i++) {
              //   const l = getDifficultyLayout([5, 7, 6, 2, 5], 5, 5, {
              //     // restarts: 1,
              //   });
              //   const board = l.board;
              //   for (let j = 0; j < 5; j++) {
              //     row1Difficulties[board[j]] += 1;
              //     diagDifficulties[board[j * 6]] += 1;
              //   }
              // }
              // console.log(row1Difficulties.map((r) => r / trials));
              // console.log(diagDifficulties.map((r) => r / trials));
            }}
          >
            Copy Goals to Clipboard
          </Button>
          {createdIds.length > 0 && (
            <Alert
              variant="light"
              color="green"
              title="Success!"
              icon={<IconCheck />}
            >
              {createdIds.length === 1 && (
                <>
                  <a
                    href={getRoomLink(createdIds[0], createdPassword)}
                    target="_blank"
                  >
                    Your new room is available at here.
                  </a>
                  <br />
                  <Link
                    prefetch={false}
                    href={`/match/${createdIds[0]}`}
                    target="_blank"
                  >
                    Your Match results can be viewed here.
                  </Link>
                </>
              )}
              {createdIds.length > 1 && (
                <>
                  Your new rooms are available here:
                  <List>
                    {createdIds.map((createdId, idx) => (
                      <List.Item key={createdId}>
                        <a href={getRoomLink(createdId, createdPassword)}>
                          <Text size="sm">Room {idx + 1}</Text>
                        </a>
                      </List.Item>
                    ))}
                  </List>
                  <br />
                  Your Match results can be viewed here:
                  <List>
                    {createdIds.map((createdId, idx) => (
                      <List.Item key={createdId}>
                        <a href={`/match/${createdId}`}>
                          <Text size="sm">Match results {idx + 1}</Text>
                        </a>
                      </List.Item>
                    ))}
                  </List>
                </>
              )}
            </Alert>
          )}
          {error != null && (
            <Alert
              variant="light"
              color="red"
              title="Failed to create bingo board"
              icon={<IconExclamationMark />}
            >
              <Stack gap={8}>
                <span>
                  You can select a different backend, then try to create the
                  match again.
                </span>
                <span>{error.message}</span>
              </Stack>
            </Alert>
          )}
        </Stack>
      </Card.Section>
      {isFilterModalShown && (
        <FiltersModal
          pasta={metadata.type === "Custom" ? customUfo! : metadata.pasta}
          onClose={() => setIsFilterModalShown(false)}
          filterInfo={filterInfo}
          setFilterInfo={setFilterInfo}
          variant={variant}
        />
      )}
    </>
  );
}

function getDefaultDifficultyCounts(
  pasta: UFOPasta,
  rows: number,
  cols: number,
): Counts {
  if (rows === 5 && cols === 5) {
    return pasta.category_counts;
  }
  const foundConfig = pasta.other_category_counts?.find(
    (config) => config.rows === rows && config.cols === cols,
  );
  if (foundConfig != null) {
    return foundConfig.category_counts;
  }
  return scaleCounts(pasta.category_counts, rows * cols);
}

function scaleCounts(counts: Counts, targetTotal: number): Counts {
  const entries = Object.entries(counts);
  const originalTotal = entries.reduce((acc, [, value]) => acc + value, 0);

  if (originalTotal === 0 || targetTotal === 0) {
    throw new Error("Cannot scale to/from 0");
  }

  const scaledCounts = entries.map(([difficulty, count], index) => {
    const exact = (count / originalTotal) * targetTotal;
    const floor = Math.floor(exact);

    return {
      difficulty,
      value: floor,
      remainder: exact - floor,
      order: index,
    };
  });
  scaledCounts.sort((a, b) => {
    const remainderDiff = b.remainder - a.remainder;
    if (remainderDiff !== 0) {
      return remainderDiff;
    }
    return a.order - b.order;
  });

  const remaining =
    targetTotal - scaledCounts.reduce((acc, item) => acc + item.value, 0);
  for (let i = 0; i < remaining; i++) {
    scaledCounts[i].value += 1;
  }

  return Object.fromEntries(
    scaledCounts.map((item) => [item.difficulty, item.value]),
  );
}
