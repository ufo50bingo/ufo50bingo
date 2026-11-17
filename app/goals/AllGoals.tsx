"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  IconChevronDown,
  IconChevronUp,
  IconInfoCircle,
  IconPlayerPlay,
  IconSelector,
} from "@tabler/icons-react";
import {
  ActionIcon,
  Center,
  Checkbox,
  Container,
  Group,
  Table,
  Text,
  Tooltip,
  UnstyledButton,
} from "@mantine/core";
import { useAppContext } from "../AppContextProvider";
import Duration from "../practice/Duration";
import { compareByDifficulty, ProperGame } from "../goals";
import PlaylistAddButton from "../PlaylistAddButton";
import { BaseToken, Plain, ResolvedToken } from "../generator/splitAtTokens";
import EditableParts from "./EditableParts";
import resolveTokens from "../generator/resolveTokens";
import getResolvedGoalText from "../generator/getResolvedGoalText";
import compareByDefault from "./compareByDefault";
import getSplitGoals, { SplitGoal } from "../generator/getSplitGoals";
import getFlatGoals from "../generator/getFlatGoals";
import { usePracticePasta } from "../usePracticePasta";
import getSubcategoryName from "../generator/getSubcategoryName";
import getCategoryName from "../generator/getCategoryName";
import isInNormalFormat from "../generator/isInNormalFormat";
import { PracticeVariant, usePracticeVariant } from "../PracticeVariantContext";
import { Metadata } from "next";
import { STANDARD_UFO } from "../pastas/standardUfo";
import { DOC_LINKS } from "../practice/docLinks";
import Link from "next/link";

export const metadata: Metadata = {
  title: "All UFO 50 Bingo Goals",
  description:
    "See the full list of UFO 50 Bingo goals, and your stats for each!",
};

export default function AllGoals() {
  const practiceVariant = usePracticeVariant();
  if (practiceVariant == null) {
    return null;
  }
  return <Inner practiceVariant={practiceVariant} />;
}

function Inner({ practiceVariant }: { practiceVariant: PracticeVariant }) {
  const { goalStats, isGoalSelected, setGoalsSelected, setGoalPartsAndPasta } =
    useAppContext();
  const pasta = usePracticePasta();
  const flatGoals = getFlatGoals(pasta);

  const [splitGoals, setSplitGoals] = useState<ReadonlyArray<SplitGoal>>(() =>
    getSplitGoals(pasta),
  );

  useEffect(() => {
    setSplitGoals(getSplitGoals(pasta));
  }, [pasta]);

  const router = useRouter();
  const onTryGoal = (
    goalParts: ReadonlyArray<Plain | BaseToken | ResolvedToken>,
    sortTokens: null | undefined | string | ReadonlyArray<string>,
  ) => {
    setGoalPartsAndPasta(resolveTokens(goalParts, pasta, sortTokens), pasta);
    if (practiceVariant !== "standard") {
      router.push(`/practice?v=${practiceVariant}`);
    } else {
      router.push(`/practice`);
    }
  };

  const normalGoals = flatGoals.filter((goal) =>
    isInNormalFormat(goal.category, pasta),
  );
  // only "normal" goals need to be checked for allChecked to be true, since
  // we don't want to accidentally show people non-normal goals unless they ask for it
  const allChecked = normalGoals.every(isGoalSelected);
  const allUnchecked = flatGoals.every((goal) => !isGoalSelected(goal));

  const [sortBy, setSortBy] = useState<string>("goal");
  const [reverseSortDirection, setReverseSortDirection] = useState(false);

  const setSorting = (field: string) => {
    const reversed = field === sortBy ? !reverseSortDirection : false;
    setReverseSortDirection(reversed);
    setSortBy(field);
  };

  const sortedRows = useMemo(() => {
    switch (sortBy) {
      case "goal":
        return reverseSortDirection
          ? splitGoals.toSorted(compareByDefault).toReversed()
          : splitGoals.toSorted(compareByDefault);
      case "difficulty":
        const sortedByDifficulty = splitGoals.toSorted(compareByDifficulty);
        return reverseSortDirection
          ? sortedByDifficulty.toReversed()
          : sortedByDifficulty;
      case "average":
        const sortedByAverageDuration = splitGoals.toSorted((a, b) => {
          const aDur = goalStats.get(a.partiallyResolvedGoal)?.averageDuration;
          const bDur = goalStats.get(b.partiallyResolvedGoal)?.averageDuration;
          if (aDur == null || bDur == null) {
            if (aDur == null && bDur != null) {
              return 1;
            } else if (aDur != null && bDur == null) {
              return -1;
            } else {
              return 0;
            }
          } else {
            return aDur - bDur;
          }
        });
        return reverseSortDirection
          ? sortedByAverageDuration.toReversed()
          : sortedByAverageDuration;
      case "best":
        const sortedByBestDuration = splitGoals.toSorted((a, b) => {
          const aDur = goalStats.get(a.partiallyResolvedGoal)?.bestDuration;
          const bDur = goalStats.get(b.partiallyResolvedGoal)?.bestDuration;
          if (aDur == null || bDur == null) {
            if (aDur == null && bDur != null) {
              return 1;
            } else if (aDur != null && bDur == null) {
              return -1;
            } else {
              return 0;
            }
          } else {
            return aDur - bDur;
          }
        });
        return reverseSortDirection
          ? sortedByBestDuration.toReversed()
          : sortedByBestDuration;
      case "count":
        const sortedByCount = splitGoals.toSorted((a, b) => {
          const aCount = goalStats.get(a.partiallyResolvedGoal)?.count ?? 0;
          const bCount = goalStats.get(b.partiallyResolvedGoal)?.count ?? 0;
          return aCount - bCount;
        });
        return reverseSortDirection
          ? sortedByCount.toReversed()
          : sortedByCount;
      default:
        return splitGoals;
    }
  }, [sortBy, reverseSortDirection, splitGoals, goalStats]);

  return (
    <Container my="md">
      <Table striped highlightOnHover withTableBorder>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>
              <Checkbox
                checked={allChecked}
                indeterminate={!allChecked && !allUnchecked}
                onChange={async (event) => {
                  if (event.currentTarget.checked) {
                    // select all should not alter non-normal goals
                    await setGoalsSelected(normalGoals, true);
                  } else {
                    await setGoalsSelected(flatGoals, false);
                  }
                }}
              />
            </Table.Th>
            <SortableTh
              sorted={sortBy === "goal"}
              reversed={reverseSortDirection}
              onSort={() => setSorting("goal")}
            >
              <ThText>Goal</ThText>
            </SortableTh>
            <Table.Th>Game</Table.Th>
            <SortableTh
              sorted={sortBy === "difficulty"}
              reversed={reverseSortDirection}
              onSort={() => setSorting("difficulty")}
            >
              <ThText>Difficulty</ThText>
            </SortableTh>
            <SortableTh
              sorted={sortBy === "average"}
              reversed={reverseSortDirection}
              onSort={() => setSorting("average")}
            >
              <ThText>Average</ThText>
            </SortableTh>
            <SortableTh
              sorted={sortBy === "best"}
              reversed={reverseSortDirection}
              onSort={() => setSorting("best")}
            >
              <ThText>Best</ThText>
            </SortableTh>
            <SortableTh
              sorted={sortBy === "count"}
              reversed={reverseSortDirection}
              onSort={() => setSorting("count")}
            >
              <ThText>Tries</ThText>
            </SortableTh>
            <Table.Th />
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {sortedRows.map((goal) => {
            const stats = goalStats.get(
              goal.parts.some((part) => part.type === "token")
                ? goal.name
                : goal.partiallyResolvedGoal,
            );
            const averageDuration = stats?.averageDuration;
            const bestDuration = stats?.bestDuration;
            let resourceLink = null;
            if (pasta === STANDARD_UFO) {
              if (goal.category === "general") {
                resourceLink = DOC_LINKS["general"];
              } else {
                resourceLink = DOC_LINKS[goal.subcategory as ProperGame];
              }
            }
            return (
              <Table.Tr key={goal.name}>
                <Table.Td>
                  <Tooltip
                    label={<>The Practice tab will exclude unchecked goals</>}
                  >
                    <Checkbox
                      checked={isGoalSelected(goal)}
                      onChange={async (event) =>
                        await setGoalsSelected(
                          [goal],
                          event.currentTarget.checked,
                        )
                      }
                    />
                  </Tooltip>
                </Table.Td>
                <Table.Td>
                  <EditableParts
                    parts={goal.parts}
                    setParts={(newParts) => {
                      const newRow = {
                        ...goal,
                        parts: newParts,
                        partiallyResolvedGoal: getResolvedGoalText(newParts),
                      };
                      const index = splitGoals.findIndex(
                        (g) => g.name === goal.name,
                      );
                      const newSplitGoals = splitGoals.toSpliced(
                        index,
                        1,
                        newRow,
                      );
                      setSplitGoals(newSplitGoals);
                    }}
                    canClear={true}
                    tokens={pasta.tokens}
                  />
                  {!isInNormalFormat(goal.category, pasta) && (
                    <Tooltip label="Not included in Normal format">
                      <IconInfoCircle
                        size={14}
                        color="var(--mantine-color-dimmed)"
                        style={{ marginLeft: 4, verticalAlign: "text-bottom" }}
                        aria-label="Not included in Normal format"
                      />
                    </Tooltip>
                  )}
                </Table.Td>
                <Table.Td>
                  {resourceLink != null ? (
                    <Tooltip label="View community-maintained resources for this game">
                      <Link
                        prefetch={false}
                        href={resourceLink}
                        target="_blank"
                      >
                        {getSubcategoryName(goal.subcategory)}
                      </Link>
                    </Tooltip>
                  ) : (
                    getSubcategoryName(goal.subcategory)
                  )}
                </Table.Td>
                <Table.Td>{getCategoryName(goal.category)}</Table.Td>
                <Table.Td>
                  {averageDuration == null ? (
                    "-"
                  ) : (
                    <Duration duration={averageDuration} />
                  )}
                </Table.Td>
                <Table.Td>
                  {bestDuration == null ? (
                    "-"
                  ) : (
                    <Duration duration={bestDuration} />
                  )}
                </Table.Td>
                <Table.Td>{stats?.count ?? 0}</Table.Td>
                <Table.Td>
                  <Group gap={4} wrap="nowrap">
                    <Tooltip label="Attempt this goal">
                      <ActionIcon
                        onClick={() => onTryGoal(goal.parts, goal.sortTokens)}
                      >
                        <IconPlayerPlay size={16} />
                      </ActionIcon>
                    </Tooltip>
                    <PlaylistAddButton
                      goal={goal.partiallyResolvedGoal}
                      pasta={pasta}
                      sortTokens={goal.sortTokens}
                    />
                  </Group>
                </Table.Td>
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>
    </Container>
  );
}

type SortableThProps = {
  children: React.ReactNode;
  reversed: boolean;
  sorted: boolean;
  onSort: () => void;
};

function ThText({ children }: { children: React.ReactNode }) {
  return (
    <Text size="14px">
      <strong>{children}</strong>
    </Text>
  );
}

function SortableTh({ children, reversed, sorted, onSort }: SortableThProps) {
  const Icon = sorted
    ? reversed
      ? IconChevronDown
      : IconChevronUp
    : IconSelector;
  return (
    <Table.Th>
      <UnstyledButton onClick={onSort}>
        <Group gap={4} wrap="nowrap">
          {children}
          <Center>
            <Icon size={16} stroke={1.5} />
          </Center>
        </Group>
      </UnstyledButton>
    </Table.Th>
  );
}
