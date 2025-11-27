import { GAME_NAMES, ORDERED_PROPER_GAMES, ProperGame } from "@/app/goals";
import { Select } from "@mantine/core";
import { ReactNode } from "react";

type Props = {
  label: ReactNode;
  game: ProperGame | null;
  onChange: (newGame: ProperGame | null) => void;
};

const DATA = ORDERED_PROPER_GAMES.map((game) => ({
  value: game,
  label: GAME_NAMES[game],
}));

export default function GameSelector({ label, game, onChange }: Props) {
  return (
    <Select
      label={label}
      value={game}
      onChange={(newValue) =>
        onChange(newValue == null ? null : (newValue as ProperGame))
      }
      placeholder="Select game"
      data={DATA}
      allowDeselect={false}
      searchable={true}
      clearable={true}
    />
  );
}
