import { Stack } from "@mantine/core";
import DisconnectButton from "./DisconnectButton";
import SwitchViewButton from "./SwitchViewButton";
import { NewFeedItem } from "@/app/fetchFeed";
import { GenericMember } from "./useMembers";

type Props = {
  userId: number;
  isMobile: boolean;
  isCast: boolean;
  sendEvents: (newEvent: ReadonlyArray<NewFeedItem>) => Promise<boolean>;
  members: ReadonlyMap<number, GenericMember>;
};

export default function BottomSection({
  userId,
  isMobile,
  isCast,
  sendEvents,
  members,
}: Props) {
  return (
    <Stack p="md">
      <SwitchViewButton
        userId={userId}
        isMobile={isMobile}
        isCast={isCast}
        sendEvents={sendEvents}
        members={members}
      />
      <DisconnectButton
        userId={userId}
        isMobile={isMobile}
        sendEvents={sendEvents}
      />
    </Stack>
  );
}
