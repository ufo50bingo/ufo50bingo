import { FeedEndGame, NewFeedItem } from "@/app/fetchFeed";
import { Button, Checkbox, Popover, Stack, Text } from "@mantine/core";
import { ReactNode, useState } from "react";
import { useServerOffsetContext } from "../ServerOffsetContext";

type Props = {
  button: ReactNode;
  isCast: boolean;
  hasCasters: boolean;
  userId: number;
  sendEvents: (newEvents: ReadonlyArray<NewFeedItem>) => Promise<boolean>;
};

export default function EndMatchPopover({
  button,
  isCast,
  hasCasters,
  userId,
  sendEvents,
}: Props) {
  const { getServerMsFromClientMs } = useServerOffsetContext();
  const position = isCast ? "bottom-start" : "bottom-end";
  const [isConfirmed, setIsConfirmed] = useState(false);
  return (
    <Popover
      key="not_started"
      width={320}
      position={position}
      withArrow
      shadow="md"
    >
      <Popover.Target>{button}</Popover.Target>
      <Popover.Dropdown>
        <Stack>
          <Text>
            Are you sure you want to end the match?
            {!isCast && hasCasters && (
              <>
                {" "}
                Your match has casters, and{" "}
                <strong>casters should usually end the match.</strong>
              </>
            )}
            <br />
            <br />
            <strong>This cannot be undone!</strong> If you aren't sure, pause
            the game and discuss.
          </Text>
          <Checkbox
            label="I understand that this is final"
            checked={isConfirmed}
            onChange={(e) => setIsConfirmed(e.target.checked)}
          />
          <Button
            disabled={!isConfirmed}
            color="red"
            onClick={async () => {
              const endEvent: FeedEndGame = {
                type: "end_game",
                userId,
                time: getServerMsFromClientMs(Date.now()) / 1000,
              };
              await sendEvents([endEvent]);
            }}
          >
            End match
          </Button>
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
}
