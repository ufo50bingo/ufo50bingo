import { Button, Group, TextInput } from "@mantine/core";
import { useState } from "react";

export default function ChatInput() {
  const [text, setText] = useState("");
  return (
    <Group>
      <TextInput
        style={{ flexGrow: "1" }}
        value={text}
        onChange={(event) => setText(event.currentTarget.value)}
      />
      <Button
        onClick={() => {
          setText("");
        }}
      >
        Send
      </Button>
    </Group>
  );
}
