import { Stack } from "@mantine/core";
import DisconnectButton from "./DisconnectButton";
import SwitchViewButton from "./SwitchViewButton";
import { NewFeedItem } from "@/app/fetchFeed";
import { GenericMember } from "./useMembers";

type Props = {
  userId: number;
  isMobile: boolean;
  isCast: boolean;
  sendEvent: (newEvent: NewFeedItem) => Promise<boolean>;
  members: ReadonlyMap<number, GenericMember>;
};

export default function BottomSection({
  userId,
  isMobile,
  isCast,
  sendEvent,
  members,
}: Props) {
  return (
    <Stack p="md">
      <SwitchViewButton
        userId={userId}
        isMobile={isMobile}
        isCast={isCast}
        sendEvent={sendEvent}
        members={members}
      />
      <DisconnectButton
        userId={userId}
        isMobile={isMobile}
        sendEvent={sendEvent}
      />
    </Stack>
  );
}
