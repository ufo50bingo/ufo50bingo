'use client';

import { Dispatch, SetStateAction, useMemo, useState } from 'react';
import { IconPlayerPlay, IconX } from '@tabler/icons-react';
import { ActionIcon, Anchor, Button, Group, Modal, Table, Tooltip } from '@mantine/core';
import { AttemptRow, db } from './db';
import Duration from './Duration';
import PlaylistAddButton from './PlaylistAddButton';
import { GoalStats } from './useGoalStats';

type Props = {
  attempts: AttemptRow[];
  goalStats: Map<string, GoalStats>;
  onRetryGoal: (goal: string) => any;
};

export default function AllAttempts({ attempts, goalStats, onRetryGoal }: Props) {
  const [deletingAttempt, setDeletingAttempt] = useState<AttemptRow | null>(null);
  const [displayedCount, setDisplayedCount] = useState<number>(20);

  const displayedAttempts = useMemo(
    () => attempts.slice(0, displayedCount),
    [attempts, displayedCount]
  );

  return (
    <>
      <Table striped highlightOnHover withTableBorder>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Goal</Table.Th>
            <Table.Th>Time</Table.Th>
            <Table.Th>Average</Table.Th>
            <Table.Th>Best</Table.Th>
            <Table.Th>Tries</Table.Th>
            <Table.Th>Started At</Table.Th>
            <Table.Th></Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {displayedAttempts?.map((attempt) => {
            const stats = goalStats.get(attempt.goal);
            const averageDuration = stats?.averageDuration;
            const bestDuration = stats?.bestDuration;
            return (
              <Table.Tr key={attempt.id}>
                <Table.Td>{attempt.goal}</Table.Td>
                <Table.Td>
                  <Duration duration={attempt.duration} />
                </Table.Td>
                <Table.Td>
                  {averageDuration == null ? '-' : <Duration duration={averageDuration} />}
                </Table.Td>
                <Table.Td>
                  {bestDuration == null ? '-' : <Duration duration={bestDuration} />}
                </Table.Td>
                <Table.Td>{stats?.count ?? 0}</Table.Td>
                <Table.Td>
                  {new Date(attempt.startTime).toLocaleString(undefined, {
                    month: 'numeric',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                    second: 'numeric',
                  })}
                </Table.Td>
                <Table.Td>
                  <Group gap={4} wrap="nowrap">
                    <Tooltip label="Attempt this goal again">
                      <ActionIcon>
                        <IconPlayerPlay size={16} onClick={() => onRetryGoal(attempt.goal)} />
                      </ActionIcon>
                    </Tooltip>
                    <PlaylistAddButton goal={attempt.goal} />
                    <Tooltip label="Delete this attempt">
                      <ActionIcon onClick={() => setDeletingAttempt(attempt)} color="red">
                        <IconX size={16} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </Table.Td>
              </Table.Tr>
            );
          })}
          {displayedCount < attempts.length && (
            <Table.Tr>
              <Table.Td colSpan={7}>
                <Anchor
                  onClick={() => setDisplayedCount((prevDisplayedCount) => prevDisplayedCount + 20)}
                >
                  Show more... ({attempts.length - displayedCount} remaining)
                </Anchor>
              </Table.Td>
            </Table.Tr>
          )}
        </Table.Tbody>
      </Table>
      <Modal
        centered={true}
        onClose={() => setDeletingAttempt(null)}
        opened={deletingAttempt != null}
        title="Confirm Deletion"
      >
        Are you sure you want to delete this attempt? This is not reversible.
        <Group mt="lg" justify="flex-end">
          <Button onClick={() => setDeletingAttempt(null)}>Cancel</Button>
          <Button
            onClick={() => {
              if (deletingAttempt != null) {
                db.attempts.delete(deletingAttempt.id);
              }
              setDeletingAttempt(null);
            }}
            color="red"
          >
            Delete
          </Button>
        </Group>
      </Modal>
    </>
  );
}
