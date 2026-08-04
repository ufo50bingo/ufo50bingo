import { useState } from "react";
import { FiltersMode, GameFilter } from "./FiltersModal";
import { Button, Group, JsonInput, Stack, TextInput } from "@mantine/core";
import ModalLayout from "./ModalLayout";
import { db } from "../db";
import { Variant } from "../pastas/metadata";

type Props = {
  setMode: (newMode: FiltersMode) => unknown;
  variant: Variant;
};

export default function FiltersImport({ setMode, variant }: Props) {
  const [name, setName] = useState("");
  const [json, setJson] = useState("");
  const [parsed, setParsed] = useState<null | GameFilter>(null);
  return (
    <ModalLayout
      content={
        <Stack>
          <TextInput
            label="Name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <JsonInput
            autosize
            label="Paste the exported content here"
            maxRows={12}
            minRows={12}
            onChange={(value) => {
              setJson(value);
              try {
                setParsed(JSON.parse(value));
              } catch {
                setParsed(null);
              }
            }}
            spellCheck={false}
            validationError="Invalid JSON"
            value={json}
          />
        </Stack>
      }
      footer={
        <Group justify="end" gap={8}>
          <Button onClick={() => setMode({ type: "select" })}>Back</Button>
          <Button
            color="green"
            disabled={parsed == null || name === ""}
            onClick={async () => {
              await db.gameFilters.add({
                variant,
                name,
                time: Date.now(),
                filterJson: JSON.stringify(parsed),
              });
              setMode({ type: "select" });
            }}
          >
            Import
          </Button>
        </Group>
      }
    />
  );
}
