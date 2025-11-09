import { Button, Stack, Text, Accordion } from "@mantine/core";
import { REQUEST_PAUSE_CHAT } from "./REQUEST_PAUSE_CHAT";
import sendChat from "./sendChat";

type Props = {
  id: string;
};

export default function RequestPauseSection({ id }: Props) {
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
              await sendChat(id, REQUEST_PAUSE_CHAT);
            }}
          >
            Request Pause
          </Button>
        </Stack>
      </Accordion.Panel>
    </Accordion.Item>
  );
}
