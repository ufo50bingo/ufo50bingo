'use client';

import { useCallback, useState } from 'react';
import {
  IconBorderAll,
  IconDeviceGamepad,
  IconFilter,
  IconPlaylistAdd,
  IconScript,
  IconSettings,
  IconVs,
} from '@tabler/icons-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Tabs } from '@mantine/core';
import AllGoals from './AllGoals';
import BoardAnalyzer from './BoardAnalyzer';
import CreateBoard from './CreateBoard';
import { db } from './db';
import Playlist from './Playlist';
import Practice from './Practice';
import Resources from './Resources';
import Settings, { NextGoalChoice } from './Settings';
import useGoalStats, { GoalStats } from './useGoalStats';
import useSelectedGoals from './useSelectedGoals';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<string | null>('createBoard');
  const [nextGoalChoice, setNextGoalChoiceRaw] = useState(
    global.window != undefined &&
      localStorage?.getItem('nextGoalChoice') === NextGoalChoice.PREFER_FEWER_ATTEMPTS
      ? NextGoalChoice.PREFER_FEWER_ATTEMPTS
      : NextGoalChoice.RANDOM
  );

  const setNextGoalChoice = useCallback(
    (newNextGoalChoice: NextGoalChoice) => {
      setNextGoalChoiceRaw(newNextGoalChoice);
      window?.localStorage?.setItem('nextGoalChoice', newNextGoalChoice);
    },
    [setNextGoalChoiceRaw]
  );

  const attempts = useLiveQuery(() => db.attempts.orderBy('startTime').reverse().toArray()) ?? [];
  const playlist = useLiveQuery(() => db.playlist.orderBy('priority').toArray()) ?? [];
  const goalStats = useGoalStats(attempts);
  const selectedGoals = useSelectedGoals();

  const getRandomGoal = useCallback(() => {
    switch (nextGoalChoice) {
      case NextGoalChoice.PREFER_FEWER_ATTEMPTS:
        return getGoalPreferFewerAttempts(selectedGoals, goalStats);
      case NextGoalChoice.RANDOM:
      default:
        const items = Array.from(selectedGoals);
        return items[Math.floor(Math.random() * items.length)];
    }
  }, [nextGoalChoice, selectedGoals, goalStats]);

  const [goal, setGoalRaw] = useState(getRandomGoal());
  const setGoal = useCallback(
    (goal: string) => {
      setGoalRaw(goal);
      window.scrollTo({ top: 0, behavior: 'instant' });
    },
    [setGoalRaw]
  );

  const goToNextGoal = useCallback(async () => {
    if (playlist.length > 0) {
      setGoal(playlist[0].goal);
      db.playlist.delete(playlist[0].id);
    } else {
      setGoal(getRandomGoal());
    }
  }, [playlist, getRandomGoal, goal, setGoal]);

  return (
    <Tabs value={activeTab} onChange={setActiveTab}>
      <Tabs.List>
        <Tabs.Tab value="createBoard" leftSection={<IconVs size={12} />}>
          Create Board
        </Tabs.Tab>
        <Tabs.Tab value="resources" leftSection={<IconScript size={12} />}>
          Resources
        </Tabs.Tab>
        <Tabs.Tab value="practice" leftSection={<IconDeviceGamepad size={12} />}>
          Practice
        </Tabs.Tab>
        <Tabs.Tab value="allGoals" leftSection={<IconFilter size={12} />}>
          All Goals
        </Tabs.Tab>
        <Tabs.Tab value="playlist" leftSection={<IconPlaylistAdd size={12} />}>
          Playlist
        </Tabs.Tab>
        <Tabs.Tab value="settings" leftSection={<IconSettings size={12} />}>
          Settings
        </Tabs.Tab>
        {/* disabling board analyzer until it's ready */}
        {false && (
          <Tabs.Tab value="boardAnalyzer" leftSection={<IconBorderAll size={12} />}>
            Board Analyzer
          </Tabs.Tab>
        )}
      </Tabs.List>

      <Tabs.Panel value="createBoard">
        <CreateBoard />
      </Tabs.Panel>
      <Tabs.Panel value="resources">
        <Resources />
      </Tabs.Panel>
      <Tabs.Panel value="practice">
        <Practice
          attempts={attempts}
          goalStats={goalStats}
          goToNextGoal={goToNextGoal}
          goal={goal}
          setGoal={setGoal}
        />
      </Tabs.Panel>
      <Tabs.Panel value="allGoals">
        <AllGoals
          attempts={attempts}
          goalStats={goalStats}
          selectedGoals={selectedGoals}
          onTryGoal={(goal) => {
            setGoal(goal);
            setActiveTab('practice');
          }}
        />
      </Tabs.Panel>
      <Tabs.Panel value="playlist">
        <Playlist playlist={playlist} />
      </Tabs.Panel>
      <Tabs.Panel value="settings">
        <Settings nextGoalChoice={nextGoalChoice} setNextGoalChoice={setNextGoalChoice} />
      </Tabs.Panel>
      <Tabs.Panel value="boardAnalyzer">
        <BoardAnalyzer goalStats={goalStats} />
      </Tabs.Panel>
    </Tabs>
  );
}

function getGoalPreferFewerAttempts(
  selectedGoals: Set<string>,
  goalStats: Map<string, GoalStats>
): string {
  const goals = Array.from(selectedGoals);

  let cumulativeWeight = 0;
  const allCumulativeWeights: number[] = [];
  goals.forEach((goal) => {
    const count = goalStats.get(goal)?.count ?? 0;
    // if the goal hasn't been done before, it's weighted 4 times as heavily as a single completion
    const weight = count === 0 ? 4 : 1 / count;
    cumulativeWeight += weight;
    allCumulativeWeights.push(cumulativeWeight);
  });

  const randomWeight = Math.random() * cumulativeWeight;

  const goalIndex = allCumulativeWeights.findIndex((cutoff) => cutoff >= randomWeight);
  return goals[goalIndex];
}
