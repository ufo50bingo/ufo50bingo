import { Accordion, Alert, Button, Stack } from "@mantine/core";
import { useParams } from "next/navigation";
import { RoomView } from "../roomCookie";
import { FullSyncedTimerEvent } from "./useSyncedTimer";
import { useServerOffsetContext } from "../ServerOffsetContext";

type Props = {
  addEvent: (newEvent: FullSyncedTimerEvent) => Promise<void>;
  seed: number;
  view: RoomView;
};

export default function CountdownSection({ view, seed, addEvent }: Props) {
  const { id } = useParams<{ id: string }>();
  const { getServerMsFromClientMs } = useServerOffsetContext();
  return (
    <Accordion.Item value="countdown">
      <Accordion.Control>Start Countdown</Accordion.Control>
      <Accordion.Panel>
        <Stack>
          <Alert color="yellow" title="WARNING!">
            You should not minimize your browser after starting a countdown!
            {view === "play" && (
              <>
                <br />
                <br />
                If your game has a caster, please let the caster start the
                countdown instead!
              </>
            )}
          </Alert>

          <Button
            onClick={async () => {
              await addEvent({
                room_id: id,
                seed,
                time: getServerMsFromClientMs(Date.now()),
                event: "start",
                duration: null,
              });
            }}
          >
            Start Countdown
          </Button>
        </Stack>
      </Accordion.Panel>
    </Accordion.Item>
  );
}
