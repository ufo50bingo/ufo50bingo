import { useState } from "react";
import { Combobox, Input, InputBase, useCombobox } from "@mantine/core";
import { ALL_PLAYERS } from "./leagueConstants";

type Props = {
  label: string;
  player: string | null;
  setPlayer: (newPlayer: string) => void;
};

export default function PlayerSelector({ label, player, setPlayer }: Props) {
  const [search, setSearch] = useState("");
  const combobox = useCombobox({
    onDropdownClose: () => {
      combobox.resetSelectedOption();
      combobox.focusTarget();
      setSearch("");
    },

    onDropdownOpen: () => {
      combobox.focusSearchInput();
    },
  });

  const filteredOptions = ALL_PLAYERS.filter((item) =>
    item.toLowerCase().includes(search.toLowerCase().trim())
  ).map((item) => (
    <Combobox.Option value={item} key={item}>
      {item}
    </Combobox.Option>
  ));

  return (
    <Combobox
      position="bottom-start"
      withArrow={true}
      store={combobox}
      withinPortal={true}
      onOptionSubmit={(newPlayer) => {
        setPlayer(newPlayer);
        combobox.closeDropdown();
      }}
    >
      <Combobox.Target>
        <InputBase
          label={label}
          component="button"
          type="button"
          pointer
          rightSection={<Combobox.Chevron />}
          onClick={() => combobox.toggleDropdown()}
          rightSectionPointerEvents="none"
        >
          {player}
        </InputBase>
      </Combobox.Target>

      <Combobox.Dropdown>
        <Combobox.Search
          value={search}
          onChange={(event) => setSearch(event.currentTarget.value)}
          placeholder="Search players"
        />
        <Combobox.Options mah={200} style={{ overflowY: "auto" }}>
          {filteredOptions != null && filteredOptions.length > 0 ? (
            filteredOptions
          ) : (
            <Combobox.Empty>No players found</Combobox.Empty>
          )}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}
