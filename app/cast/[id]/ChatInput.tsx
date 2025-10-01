import { Button, Group, TextInput } from "@mantine/core";
import { useState } from "react";
import sendChat from "./sendChat";
import { useParams } from "next/navigation";

type Props = { cookie: string };

export default function ChatInput({ cookie }: Props) {
  const [text, setText] = useState("");
  const { id } = useParams<{ id: string }>();
  return (
    <Group>
      <TextInput
        style={{ flexGrow: "1" }}
        value={text}
        onChange={(event) => setText(event.currentTarget.value)}
      />
      <Button
        onClick={async () => {
          await sendChat(id, text, cookie);
          setText("");
        }}
      >
        Send
      </Button>
    </Group>
  );
}
