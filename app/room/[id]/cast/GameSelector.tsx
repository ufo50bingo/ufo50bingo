import { GAME_NAMES, ORDERED_PROPER_GAMES, ProperGame } from "@/app/goals";
import BingosyncColored from "@/app/matches/BingosyncColored";
import { BingosyncColor } from "@/app/matches/parseBingosyncData";
import { Select } from "@mantine/core";

type Props = {
  color: BingosyncColor;
  game: ProperGame | null;
  onChange: (newGame: ProperGame | null) => void;
};

const DATA = ORDERED_PROPER_GAMES.map((game) => ({
  value: game,
  label: GAME_NAMES[game],
}));

export default function GameSelector({ color, game, onChange }: Props) {
  return (
    <Select
      w="124px"
      value={game}
      onChange={(newValue) =>
        onChange(newValue == null ? null : (newValue as ProperGame))
      }
      placeholder="Select game"
      data={DATA}
      allowDeselect={false}
      searchable={true}
      clearable={true}
      renderOption={(option) => (
        <BingosyncColored color={color}>{option.option.label}</BingosyncColored>
      )}
    />
  );
}
