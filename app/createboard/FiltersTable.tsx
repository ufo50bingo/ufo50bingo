import {
  Table,
  Checkbox,
  ActionIcon,
  Text,
  Group,
  Popover,
  Stack,
  Button,
  Tooltip,
} from "@mantine/core";
import {
  IconAlertSquareRounded,
  IconClipboard,
  IconEdit,
  IconTrash,
} from "@tabler/icons-react";
import { FilterInfo, FiltersMode, ParsedFilter } from "./FiltersModal";
import { db } from "../db";
import ModalLayout from "./ModalLayout";

type Props = {
  filters: ReadonlyArray<ParsedFilter>;
  setMode: (newMode: FiltersMode) => unknown;
  onClose: () => unknown;
  checkedIds: ReadonlySet<number>;
  setCheckedIds: (newCheckedIds: ReadonlySet<number>) => unknown;
  setFilterInfo: (newSelectedInfo: FilterInfo) => unknown;
  allGames: ReadonlySet<string>;
};

export default function FiltersTable({
  filters,
  setMode,
  onClose,
  checkedIds,
  setCheckedIds,
  setFilterInfo,
  allGames,
}: Props) {
  return (
    <ModalLayout
      content={
        <Table striped highlightOnHover withTableBorder>
          <Table.Thead>
            <Table.Tr>
              <Table.Th />
              <Table.Th>
                <ThText>Name</ThText>
              </Table.Th>
              <Table.Th>
                <ThText>Modified</ThText>
              </Table.Th>
              <Table.Th />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {filters.map((filter) => (
              <Table.Tr key={filter.id}>
                <Table.Td>
                  <Checkbox
                    checked={checkedIds.has(filter.id)}
                    onChange={(event) => {
                      const newIds = new Set(checkedIds);
                      if (event.currentTarget.checked) {
                        newIds.add(filter.id);
                      } else {
                        newIds.delete(filter.id);
                      }
                      setCheckedIds(newIds);
                    }}
                  />
                </Table.Td>
                <Table.Td>
                  <Group gap={4}>
                    {filter.missingGames.size > 0 && (
                      <Tooltip label="Some games have missing selections. Click the edit icon to update.">
                        <IconAlertSquareRounded color="yellow" size={14} />
                      </Tooltip>
                    )}
                    <Text>{filter.name}</Text>
                  </Group>
                </Table.Td>
                <Table.Td>
                  {new Date(filter.time).toLocaleString(undefined, {
                    month: "numeric",
                    day: "numeric",
                  })}
                </Table.Td>
                <Table.Td>
                  <Group gap={4} justify="end">
                    <Tooltip label="Export to clipboard">
                      <ActionIcon
                        color="blue"
                        onClick={() => {
                          navigator.clipboard.writeText(
                            JSON.stringify(filter.filter, null, 2),
                          );
                        }}
                      >
                        <IconClipboard size={16} />
                      </ActionIcon>
                    </Tooltip>
                    <ActionIcon
                      color="green"
                      onClick={() => setMode({ type: "edit", filter })}
                    >
                      <IconEdit size={16} />
                    </ActionIcon>
                    <Popover width={320} withArrow shadow="md">
                      <Popover.Target>
                        <ActionIcon color="red">
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Popover.Target>
                      <Popover.Dropdown>
                        <Stack>
                          <Text>Are you sure you want to delete this?</Text>
                          <Button
                            color="Red"
                            onClick={async () => {
                              await db.gameFilters.delete(filter.id);
                            }}
                          >
                            Confirm Delete
                          </Button>
                        </Stack>
                      </Popover.Dropdown>
                    </Popover>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
            {filters.length < 1 && (
              <Table.Tr>
                <Table.Td colSpan={4}>
                  No saved filters found. Click "New" or "Import" to create
                  saved filters!
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      }
      footer={
        <Group justify="end" gap={8}>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={() => setMode({ type: "create" })}>New</Button>
          <Button onClick={() => setMode({ type: "import" })}>Import</Button>
          <Button
            color="green"
            onClick={() => {
              let includedGames = new Set(allGames);
              for (const filter of filters) {
                if (checkedIds.has(filter.id)) {
                  includedGames = includedGames.intersection(
                    new Set(filter.filter.included),
                  );
                }
              }
              setFilterInfo({
                selectedIds: checkedIds,
                excludedGames: allGames.difference(includedGames),
              });
              onClose();
            }}
          >
            Apply selected
          </Button>
        </Group>
      }
    />
  );
}

function ThText({ children }: { children: React.ReactNode }) {
  return (
    <Text size="14px">
      <strong>{children}</strong>
    </Text>
  );
}
