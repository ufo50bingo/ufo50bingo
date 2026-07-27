import { useState } from "react";
import { UFOPasta } from "../generator/ufoGenerator";
import GameChecker from "./GameChecker";
import { FiltersMode, GameFilter, ParsedFilter } from "./FiltersModal";
import {
  Alert,
  Button,
  Group,
  Stack,
  TextInput,
  Text,
  List,
} from "@mantine/core";
import ModalLayout from "./ModalLayout";
import { db } from "../db";
import { IconAlertSquareRounded } from "@tabler/icons-react";

type Props = {
  pasta: UFOPasta;
  setMode: (newMode: FiltersMode) => unknown;
  allGames: ReadonlySet<string>;
  filter: ParsedFilter;
};

export default function FiltersEdit({
  pasta,
  setMode,
  allGames,
  filter,
}: Props) {
  const [name, setName] = useState(filter.name);
  const [uncheckedGames, setUncheckedGames] = useState<Set<string>>(() =>
    allGames.difference(new Set(filter.filter.included)),
  );
  return (
    <ModalLayout
      content={
        <Stack>
          <TextInput
            label="Name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          {filter.missingGames.size > 0 && (
            <Alert color="yellow" icon={<IconAlertSquareRounded />}>
              <Stack>
                <Text>
                  Your saved filter does not have a value for the following
                  games:
                </Text>
                <List>
                  {[...filter.missingGames].map((game) => (
                    <List.Item key={game}>{game}</List.Item>
                  ))}
                </List>
              </Stack>
            </Alert>
          )}
          <GameChecker
            uncheckedGames={uncheckedGames}
            setUncheckedGames={setUncheckedGames}
            sort="alphabetical"
            setSort={() => {}}
            pasta={pasta}
            canSort={false}
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
              await db.gameFilters.update(filter.id, {
                variant: "Custom",
                name,
                time: Date.now(),
                filterJson: JSON.stringify(typedFilters),
              });
              setMode({ type: "select" });
            }}
          >
            Update
          </Button>
        </Group>
      }
    />
  );
}
