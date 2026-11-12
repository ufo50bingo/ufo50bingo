import { Button, Modal, Stack, Group } from "@mantine/core";
import { IconSwitch3 } from "@tabler/icons-react";
import { useState } from "react";
import ColorSelector from "./ColorSelector";
import { BingosyncColor } from "@/app/matches/parseBingosyncData";
import { FeedMember, NewFeedItem } from "@/app/fetchFeed";
import { useServerOffsetContext } from "../ServerOffsetContext";
import { GenericMember } from "./useMembers";

type Props = {
  userId: number;
  isMobile: boolean;
  isCast: boolean;
  sendEvent: (newEvent: NewFeedItem) => Promise<boolean>;
  members: ReadonlyMap<number, GenericMember>;
};

export default function SwitchViewButton({
  userId,
  isMobile,
  isCast,
  sendEvent,
  members,
}: Props) {
  const [isSwitching, setIsSwitching] = useState(false);
  const [color, setColor] = useState<BingosyncColor>("red");
  const { getServerMsFromClientMs } = useServerOffsetContext();
  return (
    <>
      <Button
        onClick={() => setIsSwitching(true)}
        leftSection={<IconSwitch3 />}
      >
        Become {isCast ? "player" : "caster"}
      </Button>
      {isSwitching && (
        <Modal
          fullScreen={isMobile}
          centered={true}
          onClose={() => setIsSwitching(false)}
          opened={true}
          title={`Become a ${isCast ? "player" : "caster"}`}
        >
          <Stack>
            <span>
              Are you sure you want to become a {isCast ? "player" : "caster"}?
            </span>
            {isCast && (
              <ColorSelector
                label="Select color"
                color={color}
                setColor={setColor}
              />
            )}
            <Group justify="end">
              <Button onClick={() => setIsSwitching(false)}>Cancel</Button>
              <Button
                color="green"
                onClick={async () => {
                  const member = members.get(userId);
                  if (member == null) {
                    throw new Error(
                      `Failed to find member for userId ${userId}`,
                    );
                  }
                  const event: FeedMember = {
                    type: "member",
                    time: getServerMsFromClientMs(Date.now()) / 1000,
                    userId,
                    isInvite: false,
                    playerColor: isCast ? color : null,
                    name: member.name,
                    overrideName: member.overrideName,
                  };
                  await sendEvent(event);
                  window.location.reload();
                }}
              >
                Become {isCast ? "player" : "caster"}
              </Button>
            </Group>
          </Stack>
        </Modal>
      )}
    </>
  );
}
