'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { IconChevronDown, IconChevronUp, IconPlayerPlay, IconSelector } from '@tabler/icons-react';
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
} from '@mantine/core';
import { useAppContext } from '../AppContextProvider';
import { db } from '../db';
import Duration from '../Duration';
import { compareByDifficulty, DIFFICULTY_NAMES, GAME_NAMES, SORTED_FLAT_GOALS } from '../goals';
import PlaylistAddButton from '../PlaylistAddButton';

export default function AllGoals() {
  const router = useRouter();
  const { goalStats, selectedGoals, setGoal } = useAppContext();
  const onTryGoal = (goal: string) => {
    setGoal(goal);
    router.push('/practice');
  };

  const allChecked = SORTED_FLAT_GOALS.every((goal) => selectedGoals.has(goal.name));
  const allUnchecked = SORTED_FLAT_GOALS.every((goal) => !selectedGoals.has(goal.name));

  const [sortBy, setSortBy] = useState<string>('goal');
  const [reverseSortDirection, setReverseSortDirection] = useState(false);

  const setSorting = (field: string) => {
    const reversed = field === sortBy ? !reverseSortDirection : false;
    setReverseSortDirection(reversed);
    setSortBy(field);
  };

  const sortedRows = useMemo(() => {
    switch (sortBy) {
      case 'goal':
        return reverseSortDirection ? SORTED_FLAT_GOALS.toReversed() : SORTED_FLAT_GOALS;
      case 'difficulty':
        const sortedByDifficulty = SORTED_FLAT_GOALS.toSorted(compareByDifficulty);
        return reverseSortDirection ? sortedByDifficulty.toReversed() : sortedByDifficulty;
      case 'average':
        const sortedByAverageDuration = SORTED_FLAT_GOALS.toSorted((a, b) => {
          const aDur = goalStats.get(a.name)?.averageDuration;
          const bDur = goalStats.get(b.name)?.averageDuration;
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
      case 'best':
        const sortedByBestDuration = SORTED_FLAT_GOALS.toSorted((a, b) => {
          const aDur = goalStats.get(a.name)?.bestDuration;
          const bDur = goalStats.get(b.name)?.bestDuration;
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
        return reverseSortDirection ? sortedByBestDuration.toReversed() : sortedByBestDuration;
      case 'count':
        const sortedByCount = SORTED_FLAT_GOALS.toSorted((a, b) => {
          const aCount = goalStats.get(a.name)?.count ?? 0;
          const bCount = goalStats.get(b.name)?.count ?? 0;
          return aCount - bCount;
        });
        return reverseSortDirection ? sortedByCount.toReversed() : sortedByCount;
      default:
        return SORTED_FLAT_GOALS;
    }
  }, [goalStats, sortBy, reverseSortDirection]);

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
                    await db.unselectedGoals.clear();
                  } else {
                    await db.unselectedGoals.bulkAdd(
                      SORTED_FLAT_GOALS.filter((goal) => selectedGoals.has(goal.name)).map(
                        (goal) => ({ goal: goal.name })
                      )
                    );
                  }
                }}
              />
            </Table.Th>
            <SortableTh
              sorted={sortBy === 'goal'}
              reversed={reverseSortDirection}
              onSort={() => setSorting('goal')}
            >
              <ThText>Goal</ThText>
            </SortableTh>
            <Table.Th>Game</Table.Th>
            <SortableTh
              sorted={sortBy === 'difficulty'}
              reversed={reverseSortDirection}
              onSort={() => setSorting('difficulty')}
            >
              <ThText>Difficulty</ThText>
            </SortableTh>
            <SortableTh
              sorted={sortBy === 'average'}
              reversed={reverseSortDirection}
              onSort={() => setSorting('average')}
            >
              <ThText>Average</ThText>
            </SortableTh>
            <SortableTh
              sorted={sortBy === 'best'}
              reversed={reverseSortDirection}
              onSort={() => setSorting('best')}
            >
              <ThText>Best</ThText>
            </SortableTh>
            <SortableTh
              sorted={sortBy === 'count'}
              reversed={reverseSortDirection}
              onSort={() => setSorting('count')}
            >
              <ThText>Tries</ThText>
            </SortableTh>
            <Table.Th />
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {sortedRows.map((goal) => {
            const stats = goalStats.get(goal.name);
            const averageDuration = stats?.averageDuration;
            const bestDuration = stats?.bestDuration;
            return (
              <Table.Tr key={goal.name}>
                <Table.Td>
                  <Checkbox
                    checked={selectedGoals.has(goal.name)}
                    onChange={async (event) => {
                      if (event.currentTarget.checked) {
                        await db.unselectedGoals.delete(goal.name);
                      } else {
                        await db.unselectedGoals.add({ goal: goal.name });
                      }
                    }}
                  />
                </Table.Td>
                <Table.Td>{goal.name}</Table.Td>
                <Table.Td>{GAME_NAMES[goal.types[0]]}</Table.Td>
                <Table.Td>{DIFFICULTY_NAMES[goal.types[1]]}</Table.Td>
                <Table.Td>
                  {averageDuration == null ? '-' : <Duration duration={averageDuration} />}
                </Table.Td>
                <Table.Td>
                  {bestDuration == null ? '-' : <Duration duration={bestDuration} />}
                </Table.Td>
                <Table.Td>{stats?.count ?? 0}</Table.Td>
                <Table.Td>
                  <Group gap={4} wrap="nowrap">
                    <Tooltip label="Attempt this goal">
                      <ActionIcon onClick={() => onTryGoal(goal.name)}>
                        <IconPlayerPlay size={16} />
                      </ActionIcon>
                    </Tooltip>
                    <PlaylistAddButton goal={goal.name} />
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
  const Icon = sorted ? (reversed ? IconChevronDown : IconChevronUp) : IconSelector;
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
