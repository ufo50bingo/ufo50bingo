import { Button, Modal, Stack, Group } from "@mantine/core";
import { IconSwitch3 } from "@tabler/icons-react";
import { useState } from "react";
import ColorSelector from "./ColorSelector";
import { FeedMember, NewFeedItem } from "@/app/fetchFeed";
import { useServerOffsetContext } from "../ServerOffsetContext";
import { GenericMember } from "./useMembers";
import { BingosyncColor } from "@/app/color";
import { authClient } from "@/app/authClient";

interface Props {
  userId: number;
  isMobile: boolean;
  isCast: boolean;
  sendEvents: (newEvent: ReadonlyArray<NewFeedItem>) => Promise<boolean>;
  members: ReadonlyMap<number, GenericMember>;
}

export default function SwitchViewButton(props: Props) {
  const { data: session } = authClient.useSession();
  const [isSwitching, setIsSwitching] = useState(false);
  return (
    <>
      <Button
        onClick={() => setIsSwitching(true)}
        leftSection={<IconSwitch3 />}
      >
        Become {props.isCast ? "player" : "caster"}
      </Button>
      {isSwitching && (
        <SwitchViewModal
          {...props}
          session={session}
          onClose={() => setIsSwitching(false)}
        />
      )}
    </>
  );
}

interface ModalProps extends Props {
  onClose: () => unknown;
  session: ReturnType<typeof authClient.useSession>["data"];
}

function SwitchViewModal({
  onClose,
  userId,
  isMobile,
  isCast,
  sendEvents,
  members,
  session,
}: ModalProps) {
  const user = session?.user;
  const initialColor = user?.color;
  const [color, setColor] = useState<BingosyncColor>(
    initialColor != null ? (initialColor as BingosyncColor) : "red",
  );
  const { getServerMsFromClientMs } = useServerOffsetContext();
  return (
    <Modal
      fullScreen={isMobile}
      centered={true}
      onClose={onClose}
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
          <Button onClick={onClose}>Cancel</Button>
          <Button
            color="green"
            onClick={async () => {
              const member = members.get(userId);
              if (member == null) {
                throw new Error(`Failed to find member for userId ${userId}`);
              }
              const event: FeedMember = {
                type: "member",
                time: getServerMsFromClientMs(Date.now()) / 1000,
                userId,
                isInvite: false,
                playerColor: isCast ? color : null,
                name: member.name,
                overrideName: member.overrideName,
                image: user?.image ?? null,
              };
              await sendEvents([event]);
              window.location.reload();
            }}
          >
            Become {isCast ? "player" : "caster"}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
