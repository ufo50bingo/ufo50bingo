import { Button, Stack, Text, Accordion } from "@mantine/core";
import { FullSyncedTimerEvent } from "./useSyncedTimer";
import { useServerOffsetContext } from "../ServerOffsetContext";

type Props = {
  id: string;
  seed: number;
  addEvent: (newEvent: FullSyncedTimerEvent) => Promise<void>;
};

export default function RequestPauseSection({ addEvent, id, seed }: Props) {
  const { getServerMsFromClientMs } = useServerOffsetContext();
  return (
    <Accordion.Item value="pause">
      <Accordion.Control>Request Pause</Accordion.Control>
      <Accordion.Panel>
        <Stack>
          <Text size="sm">
            Requesting a pause will hide the board and play a notification alarm
            for players and casters on <strong>ufo50.bingo</strong>.
            <br />
            <br />
            Players and spectators on <strong>Bingosync</strong> will only see a
            chat message.
          </Text>
          <Button
            onClick={async () => {
              await addEvent({
                room_id: id,
                seed,
                time: getServerMsFromClientMs(Date.now()),
                event: "pause",
                duration: null,
              });
            }}
          >
            Request Pause
          </Button>
        </Stack>
      </Accordion.Panel>
    </Accordion.Item>
  );
}
