import {
  ActionIcon,
  Button,
  Checkbox,
  Group,
  Popover,
  Stack,
  TextInput,
} from "@mantine/core";
import { useState } from "react";
import sendChat from "./sendChat";
import { useParams } from "next/navigation";
import { IconEye, IconEyeOff } from "@tabler/icons-react";
import { PlayerMember } from "./useMembers";

type Props = {
  userId: number;
  players: ReadonlyArray<PlayerMember>;
};

export default function ChatInput({ userId, players }: Props) {
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const otherPlayers = players.filter((p) => p.userId !== userId);
  const [visibleToIds, setVisibleToIds] =
    useState<null | ReadonlyArray<number>>(null);

  const params = useParams<{ id: string }>();
  const gameId = Number(params.id);

  const submit = async () => {
    if (text !== "" && !isSubmitting) {
      setIsSubmitting(true);
      try {
        await sendChat(gameId, text, visibleToIds);
      } finally {
        setIsSubmitting(false);
      }
      setText("");
    }
  };

  return (
    <Group>
      {otherPlayers.length > 0 && (
        <Popover position="top" withArrow>
          <Popover.Target>
            <ActionIcon aria-label="Private message" size="lg" variant="subtle">
              {visibleToIds == null ? <IconEye /> : <IconEyeOff />}
            </ActionIcon>
          </Popover.Target>
          <Popover.Dropdown>
            <Stack>
              <span>Message will be visible to:</span>
              {otherPlayers.map((p) => (
                <Checkbox
                  key={p.userId}
                  checked={
                    visibleToIds == null || visibleToIds.includes(p.userId)
                  }
                  label={p.name}
                  onChange={(event) => {
                    if (event.currentTarget.checked) {
                      if (visibleToIds == null) {
                        return;
                      }
                      const newIds = [...visibleToIds, p.userId];
                      setVisibleToIds(
                        newIds.length === otherPlayers.length ? null : newIds,
                      );
                    } else {
                      const newIds = (
                        visibleToIds ??
                        otherPlayers.map((otherPlayer) => otherPlayer.userId)
                      ).filter((playerId) => playerId !== p.userId);
                      setVisibleToIds(newIds);
                    }
                  }}
                />
              ))}
              <span>Casters and spectators see all messsages</span>
            </Stack>
          </Popover.Dropdown>
        </Popover>
      )}
      <TextInput
        style={{ flexGrow: "1" }}
        value={text}
        onChange={(event) => setText(event.currentTarget.value)}
        onKeyDown={async (event) => {
          if (event.key === "Enter") {
            await submit();
          }
        }}
      />
      <Button disabled={text === "" || isSubmitting} onClick={submit}>
        Send
      </Button>
    </Group>
  );
}
