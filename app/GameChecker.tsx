import { Checkbox, SimpleGrid, Text } from '@mantine/core';
import { Game, GAME_NAMES, ORDERED_PROPER_GAMES } from './goals';

type Props = {
  checkState: Map<Game, boolean>;
  setCheckState: (newCheckState: Map<Game, boolean>) => void;
};

export default function GameChecker({ checkState, setCheckState }: Props) {
  const isAllChecked = checkState.values().every((isChecked) => isChecked);
  const isNoneChecked = checkState.values().every((isChecked) => !isChecked);
  return (
    <>
      <Text>
        <strong>Select included games</strong>
      </Text>
      <SimpleGrid cols={3}>
        <Checkbox
          label={
            <strong>
              <u>{isAllChecked ? 'Deselect All' : 'Select All'}</u>
            </strong>
          }
          indeterminate={!isAllChecked && !isNoneChecked}
          checked={isAllChecked}
          onChange={() => {
            const newState = new Map(ORDERED_PROPER_GAMES.map((key) => [key, !isAllChecked]));
            setCheckState(newState);
          }}
        />
        {Array.from(
          checkState.entries().map(([key, isChecked]) => (
            <Checkbox
              key={key}
              label={GAME_NAMES[key]}
              checked={isChecked}
              onChange={(event) => {
                const newState = new Map(checkState);
                newState.set(key, event.currentTarget.checked);
                setCheckState(newState);
              }}
            />
          ))
        )}
      </SimpleGrid>
    </>
  );
}
