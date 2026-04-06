import { GAME_NAMES, ORDERED_PROPER_GAMES, ProperGame } from "@/app/goals";
import BingosyncColored from "@/app/matches/BingosyncColored";
import { BingosyncColor } from "@/app/matches/parseBingosyncData";
import { ComboboxItem, OptionsFilter, Select } from "@mantine/core";
import { useCallback } from "react";
import { TERMINAL_CODES } from "./terminalCodes";

type Props = {
  color: BingosyncColor;
  game: ProperGame | null;
  onChange: (newGame: ProperGame | null) => void;
  terminalCodes: Set<string>,
};

const DATA = ORDERED_PROPER_GAMES.map((game) => ({
  value: game,
  label: GAME_NAMES[game],
}));

export default function GameSelector({ color, game, onChange, terminalCodes }: Props) {
  const optionsFilter: OptionsFilter = useCallback(({ options, search }) => {
    const lowerSearch = search.trim().toLowerCase();
    const foundCodes = [...terminalCodes].filter(
      code => TERMINAL_CODES[code] != null && code.toLowerCase().includes(lowerSearch),
    );
    const codeGames = foundCodes.map(code => TERMINAL_CODES[code]);
    return options.filter(rawOption => {
      const value = (rawOption as ComboboxItem).value as ProperGame;
      const label = (rawOption as ComboboxItem).label;
      return codeGames.includes(value) || label.toLowerCase().includes(lowerSearch) || value.includes(lowerSearch);
    });
  }, [terminalCodes]);
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
      filter={optionsFilter}
    />
  );
}
