'use client';

import { IconMoon, IconSun } from '@tabler/icons-react';
import {
  Button,
  Center,
  Container,
  MantineColorScheme,
  NativeSelect,
  SegmentedControl,
  Stack,
  Table,
  Text,
  useMantineColorScheme,
} from '@mantine/core';
import ExportCSV from './ExportCSV';
import ImportCSV from './ImportCSV';
import MigrateHistory from './MigrateHistory';

export enum NextGoalChoice {
  RANDOM = 'RANDOM',
  PREFER_FEWER_ATTEMPTS = 'PREFER_FEWER_ATTEMPTS',
}

type Props = {
  nextGoalChoice: NextGoalChoice;
  setNextGoalChoice: (nextGoalChoice: NextGoalChoice) => void;
};

export default function Settings({ nextGoalChoice, setNextGoalChoice }: Props) {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  return (
    <Container my="md">
      <Table variant="vertical" withTableBorder>
        <Table.Tbody>
          <Table.Tr>
            <Table.Th>Next goal choice</Table.Th>
            <Table.Td>
              <NativeSelect
                value={nextGoalChoice}
                onChange={(event) => setNextGoalChoice(event.currentTarget.value as NextGoalChoice)}
                data={[
                  { label: 'Fully random', value: NextGoalChoice.RANDOM },
                  {
                    label: 'Prefer goals with fewer attempts',
                    value: NextGoalChoice.PREFER_FEWER_ATTEMPTS,
                  },
                ]}
              />
            </Table.Td>
          </Table.Tr>

          <Table.Tr>
            <Table.Th>Export Attempts CSV</Table.Th>
            <Table.Td>
              <ExportCSV />
            </Table.Td>
          </Table.Tr>

          <Table.Tr>
            <Table.Th>Import Attempts CSV</Table.Th>
            <Table.Td>
              <ImportCSV />
            </Table.Td>
          </Table.Tr>

          <Table.Tr>
            <Table.Th>Migrate history for renamed goals</Table.Th>
            <Table.Td>
              <MigrateHistory />
            </Table.Td>
          </Table.Tr>

          <Table.Tr>
            <Table.Th>Theme</Table.Th>
            <Table.Td>
              <SegmentedControl
                value={colorScheme}
                onChange={(newTheme) => setColorScheme(newTheme as MantineColorScheme)}
                data={[
                  {
                    label: (
                      <Center>
                        <IconMoon stroke={1.5} />
                        <span>Dark</span>
                      </Center>
                    ),
                    value: 'dark',
                  },
                  {
                    label: (
                      <Center>
                        <IconSun stroke={1.5} />
                        <span>Light</span>
                      </Center>
                    ),
                    value: 'light',
                  },
                ]}
              />
            </Table.Td>
          </Table.Tr>
        </Table.Tbody>
      </Table>
    </Container>
  );
}
