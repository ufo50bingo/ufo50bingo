import { useState } from "react";
import { UFOPasta } from "../generator/ufoGenerator";
import GameChecker from "./GameChecker";
import { FiltersMode, GameFilter } from "./FiltersModal";
import { Button, Group, Stack, TextInput } from "@mantine/core";
import ModalLayout from "./ModalLayout";
import { db } from "../db";
import { Variant } from "../pastas/metadata";

type Props = {
  pasta: UFOPasta;
  setMode: (newMode: FiltersMode) => unknown;
  allGames: ReadonlySet<string>;
  variant: Variant;
};

export default function FiltersCreate({ pasta, setMode, allGames, variant }: Props) {
  const [name, setName] = useState("");
  const [uncheckedGames, setUncheckedGames] = useState<Set<string>>(new Set());
  return (
    <ModalLayout
      content={
        <Stack>
          <TextInput
            label="Name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <GameChecker
            canSort={false}
            uncheckedGames={uncheckedGames}
            setUncheckedGames={setUncheckedGames}
            sort="alphabetical"
            setSort={() => { }}
            pasta={pasta}
          />
        </Stack>
      }
      footer={
        <Group justify="end" gap={8}>
          <Button onClick={() => setMode({ type: "select" })}>Back</Button>
          <Button
            disabled={name === "" || allGames.size === uncheckedGames.size}
            color="green"
            onClick={async () => {
              const checkedGames = allGames.difference(uncheckedGames);
              const typedFilters: GameFilter = {
                included: [...checkedGames],
                excluded: [...uncheckedGames],
              };
              await db.gameFilters.add({
                variant,
                name,
                time: Date.now(),
                filterJson: JSON.stringify(typedFilters),
              });
              setMode({ type: "select" });
            }}
          >
            Create
          </Button>
        </Group>
      }
    />
  );
}
