import { Button, Group, TextInput } from "@mantine/core";
import { useState } from "react";
import sendChat from "./sendChat";
import { useParams } from "next/navigation";
import { RoomBackend } from "@/app/roomApi";

type Props = {
  roomBackend: RoomBackend;
};

export default function ChatInput({ roomBackend }: Props) {
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { id } = useParams<{ id: string }>();

  const submit = async () => {
    if (text !== "" && !isSubmitting) {
      setIsSubmitting(true);
      try {
        await sendChat(id, text, roomBackend);
      } finally {
        setIsSubmitting(false);
      }
      setText("");
    }
  };
  return (
    <Group>
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
