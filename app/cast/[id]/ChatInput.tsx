import { Button, Group, TextInput, Tooltip } from "@mantine/core";
import { useState } from "react";
import sendChat from "./sendChat";
import { useParams, useSearchParams } from "next/navigation";

export default function ChatInput() {
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { id } = useParams<{ id: string }>();
  const useBot = useSearchParams().get("use_bot") === "true";

  const submit = async () => {
    if (text !== "" && !isSubmitting) {
      setIsSubmitting(true);
      try {
        await sendChat(id, text);
      } finally {
        setIsSubmitting(false);
      }
      setText("");
    }
  };
  const input = (
    <Group>
      <TextInput
        disabled={useBot}
        style={{ flexGrow: "1" }}
        value={text}
        onChange={(event) => setText(event.currentTarget.value)}
        onKeyDown={async (event) => {
          if (event.key === "Enter") {
            await submit();
          }
        }}
      />
      <Button disabled={text === "" || isSubmitting || useBot} onClick={submit}>
        Send
      </Button>
    </Group>
  );
  return useBot ? (
    <Tooltip label="You have read-only access, so you cannot chat">
      {input}
    </Tooltip>
  ) : (
    input
  );
}
