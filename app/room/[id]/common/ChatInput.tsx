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
import { IconEye } from "@tabler/icons-react";

const PLAYERS = [
  { id: 1, name: "Frank" },
  { id: 2, name: "Matt" },
  { id: 3, name: "Karma" },
];

type Props = {
  userId: number;
};

export default function ChatInput({ userId }: Props) {
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const otherPlayers = PLAYERS.filter((p) => p.id !== userId);
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
              <IconEye />
            </ActionIcon>
          </Popover.Target>
          <Popover.Dropdown>
            <Stack>
              <span>Message will be visible to:</span>
              {otherPlayers.map((p) => (
                <Checkbox
                  key={p.id}
                  checked={visibleToIds == null || visibleToIds.includes(p.id)}
                  label={p.name}
                  onChange={(event) => {
                    if (event.currentTarget.checked) {
                      if (visibleToIds == null) {
                        return;
                      }
                      const newIds = [...visibleToIds, p.id];
                      setVisibleToIds(
                        newIds.length === otherPlayers.length ? null : newIds,
                      );
                    } else {
                      const newIds = (
                        visibleToIds ??
                        otherPlayers.map((otherPlayer) => otherPlayer.id)
                      ).filter((playerId) => playerId !== p.id);
                      setVisibleToIds(newIds);
                    }
                  }}
                />
              ))}
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
