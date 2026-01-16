import { IconPlaylistAdd } from "@tabler/icons-react";
import { ActionIcon, Tooltip } from "@mantine/core";
import { db } from "./db";
import replaceTokens from "./generator/replaceTokens";
import { Tokens } from "./generator/ufoGenerator";

export const PRIORITY_MULTIPLIER = 1024;

type Props = { goal: string; tokens: null | Tokens };

export default function PlaylistAddButton({ goal, tokens }: Props) {
  return (
    <Tooltip label="Add to playlist">
      <ActionIcon
        onClick={() => {
          if (tokens != null) {
            addToPlaylist(replaceTokens(goal, tokens));
            return;
          }
          addToPlaylist(goal);
        }}
        color="green"
      >
        <IconPlaylistAdd size={16} />
      </ActionIcon>
    </Tooltip>
  );
}

async function addToPlaylist(goal: string): Promise<void> {
  db.transaction("rw", db.playlist, async () => {
    const id = await db.playlist.add({ goal, priority: Infinity });
    return await db.playlist.update(id, { priority: id * PRIORITY_MULTIPLIER });
  });
}
