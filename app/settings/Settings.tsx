"use client";

import { IconAlertSquareRounded, IconMoon, IconSun } from "@tabler/icons-react";
import {
  Alert,
  Button,
  Center,
  Checkbox,
  Container,
  Group,
  MantineColorScheme,
  Modal,
  NativeSelect,
  SegmentedControl,
  Stack,
  Table,
  TextInput,
  useMantineColorScheme,
} from "@mantine/core";
import { NextGoalChoice, useAppContext } from "../AppContextProvider";
import ExportCSV from "./ExportCSV";
import ImportCSV from "./ImportCSV";
import MigrateHistory from "./MigrateHistory";
import { useState } from "react";
import enableAdmin from "../session/enableAdmin";
import useSession from "../session/useSession";
import { Metadata } from "next";
import SelectRightClickBehavior from "./SelectRightClickBehavior";
import { useShouldShortenContext } from "./ShouldShortenContext";

export const metadata: Metadata = {
  title: "UFO 50 Bingo Settings",
  description: "Manage your UFO 50 Bingo Settings",
};

export default function Settings() {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const { nextGoalChoice, setNextGoalChoice } = useAppContext();
  const [isAdminModalShown, setIsAdminModalShown] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [password, setPassword] = useState("");
  const isAdmin = useSession()?.admin;
  const { shouldShortenPlay, setShouldShortenPlay } = useShouldShortenContext();
  return (
    <Container my="md">
      <Table variant="vertical" withTableBorder>
        <Table.Tbody>
          <Table.Tr>
            <Table.Th>Next goal choice</Table.Th>
            <Table.Td>
              <NativeSelect
                value={nextGoalChoice}
                onChange={(event) =>
                  setNextGoalChoice(event.currentTarget.value as NextGoalChoice)
                }
                data={[
                  { label: "Fully random", value: NextGoalChoice.RANDOM },
                  {
                    label: "Prefer goals with fewer attempts",
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
                onChange={(newTheme) =>
                  setColorScheme(newTheme as MantineColorScheme)
                }
                data={[
                  {
                    label: (
                      <Center>
                        <IconMoon stroke={1.5} />
                        <span>Dark</span>
                      </Center>
                    ),
                    value: "dark",
                  },
                  {
                    label: (
                      <Center>
                        <IconSun stroke={1.5} />
                        <span>Light</span>
                      </Center>
                    ),
                    value: "light",
                  },
                ]}
              />
            </Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Th>Shorten goal text when possible</Table.Th>
            <Table.Td>
              <Stack>
                <Checkbox
                  checked={shouldShortenPlay}
                  onChange={(event) =>
                    setShouldShortenPlay(
                      event.target.checked,
                    )
                  }
                  label="Show shortened goal text when possible"
                />
                {shouldShortenPlay && <Alert color="yellow" icon={<IconAlertSquareRounded />}>
                  Shortened goals may leave out important information.<br />
                  You should only use shortened goal text if you are comfortable with the entire goal set.
                </Alert>}
              </Stack>
            </Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Th>Square right click behavior</Table.Th>
            <Table.Td>
              <SelectRightClickBehavior />
            </Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Th>Admin</Table.Th>
            <Table.Td>
              {isAdmin ? (
                "Admin tools enabled"
              ) : (
                <>
                  <Button onClick={() => setIsAdminModalShown(true)}>
                    Enable admin tools
                  </Button>
                  <Modal
                    centered={true}
                    onClose={() => setIsAdminModalShown(false)}
                    opened={isAdminModalShown}
                    title="Enable admin tools"
                  >
                    <Stack>
                      <TextInput
                        label="Enter password"
                        onChange={(event) => setPassword(event.target.value)}
                      />
                      <Group mt="lg" justify="flex-end">
                        <Button onClick={() => setIsAdminModalShown(false)}>
                          Cancel
                        </Button>
                        <Button
                          disabled={password === "" || isSaving}
                          onClick={async () => {
                            try {
                              await enableAdmin(password);
                              window.location.reload();
                            } finally {
                              setIsSaving(false);
                            }
                          }}
                          color="green"
                        >
                          Save
                        </Button>
                      </Group>
                    </Stack>
                  </Modal>
                </>
              )}
            </Table.Td>
          </Table.Tr>
        </Table.Tbody>
      </Table>
    </Container>
  );
}
