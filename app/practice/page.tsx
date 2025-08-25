'use client';

import { useCallback } from 'react';
import { Container, Stack } from '@mantine/core';
import AllAttempts from '../AllAttempts';
import { useAppContext } from '../AppContextProvider';
import { db } from '../db';
import Goal from '../Goal';

export default function Practice() {
  const { attempts, goalStats, goal, setGoal, playlist, getRandomGoal } = useAppContext();

  const goToNextGoal = useCallback(async () => {
    if (playlist.length > 0) {
      setGoal(playlist[0].goal);
      db.playlist.delete(playlist[0].id);
    } else {
      setGoal(getRandomGoal());
    }
  }, [playlist, getRandomGoal, goal, setGoal]);

  return (
    <Container my="md">
      <Stack>
        <Goal key={goal} goal={goal} onNext={goToNextGoal} />
        <AllAttempts attempts={attempts} goalStats={goalStats} onRetryGoal={setGoal} />
      </Stack>
    </Container>
  );
}
