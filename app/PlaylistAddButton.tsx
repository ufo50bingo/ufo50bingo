import { IconPlaylistAdd } from '@tabler/icons-react';
import { ActionIcon, Tooltip } from '@mantine/core';
import { db } from './db';

export const PRIORITY_MULTIPLIER = 1024;

type Props = { goal: string };

export default function PlaylistAddButton({ goal }: Props) {
  return (
    <Tooltip label="Add to playlist">
      <ActionIcon onClick={() => addToPlaylist(goal)} color="green">
        <IconPlaylistAdd size={16} />
      </ActionIcon>
    </Tooltip>
  );
}

async function addToPlaylist(goal: string): Promise<void> {
  db.transaction('rw', db.playlist, async () => {
    const id = await db.playlist.add({ goal, priority: Infinity });
    return await db.playlist.update(id, { priority: id * PRIORITY_MULTIPLIER });
  });
}
