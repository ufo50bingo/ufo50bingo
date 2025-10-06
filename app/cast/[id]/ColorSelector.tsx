import { ReactNode, useState } from 'react';
import { Input, InputBase, Combobox, useCombobox } from '@mantine/core';
import { BingosyncColor } from '@/app/matches/parseBingosyncData';
import BingosyncColored from '@/app/matches/BingosyncColored';

const COLORS: ReadonlyArray<BingosyncColor> = [
    'orange', 'red', 'blue', 'green', 'purple', 'navy', 'teal', 'brown', 'pink', 'yellow'
]

function displayColor(color: BingosyncColor): ReactNode {
    return <BingosyncColored color={color}><strong>{color.charAt(0).toUpperCase() + color.slice(1)}</strong></BingosyncColored>;
}

type Props = {
    label: string;
    color: BingosyncColor;
    setColor: (newColor: BingosyncColor) => unknown;
}

export default function ColorSelector({ label, color, setColor }: Props) {
    const combobox = useCombobox({
        onDropdownClose: () => combobox.resetSelectedOption(),
    });
    return (
        <Combobox
            store={combobox}
            onOptionSubmit={(val) => {
                setColor(val as BingosyncColor);
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
                    rightSectionPointerEvents="none"
                    onClick={() => combobox.toggleDropdown()}
                >
                    {displayColor(color)}
                </InputBase>
            </Combobox.Target>

            <Combobox.Dropdown>
                <Combobox.Options>
                    {COLORS.map(option =>
                        <Combobox.Option value={option} key={option}>
                            {displayColor(option)}
                        </Combobox.Option>
                    )}
                </Combobox.Options>
            </Combobox.Dropdown>
        </Combobox>
    );
}