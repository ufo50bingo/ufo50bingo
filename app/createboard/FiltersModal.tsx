import { ActionIcon, Group, Modal, Title } from "@mantine/core";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db";
import { useMemo, useState } from "react";
import FiltersTable from "./FiltersTable";
import { IconArrowLeft } from "@tabler/icons-react";
import FiltersCreate from "./FiltersCreate";
import { UFOPasta } from "../generator/ufoGenerator";
import FiltersImport from "./FiltersImport";
import getNonGeneralCategories from "./getNonGeneralCategories";
import getAllSubcategories from "./getAllSubcategories";
import FiltersEdit from "./FitlersEdit";

export type FiltersMode =
  | { type: "select" }
  | { type: "create" }
  | { type: "import" }
  | { type: "edit"; filter: ParsedFilter };

export type GameFilter = {
  included: ReadonlyArray<string>;
  excluded: ReadonlyArray<string>;
};

export type ParsedFilter = {
  id: number;
  name: string;
  time: number;
  filter: GameFilter;
  missingGames: Set<string>;
};

export type FilterInfo = {
  selectedIds: ReadonlySet<number>;
  excludedGames: ReadonlySet<string>;
};

type Props = {
  pasta: UFOPasta;
  onClose: () => unknown;
  filterInfo: FilterInfo;
  setFilterInfo: (newSelectedInfo: FilterInfo) => unknown;
};

export default function FiltersModal({
  pasta,
  onClose,
  filterInfo,
  setFilterInfo,
}: Props) {
  const [checkedIds, setCheckedIds] = useState(filterInfo.selectedIds);
  const [mode, setMode] = useState<FiltersMode>({ type: "select" });
  const dbFilters = useLiveQuery(
    () => db.gameFilters.where({ variant: "Custom" }).reverse().sortBy("time"),
    [],
  );
  const allGames = useMemo(() => {
    const nonGeneralCategories = getNonGeneralCategories(pasta);
    return new Set([...getAllSubcategories(pasta.goals, nonGeneralCategories)]);
  }, [pasta]);
  const filters: ReadonlyArray<ParsedFilter> = useMemo(() => {
    return (dbFilters ?? [])
      .map((dbFilter) => {
        try {
          const parsed: GameFilter = JSON.parse(dbFilter.filterJson);
          const missingGames = allGames
            .difference(new Set(parsed.excluded))
            .difference(new Set(parsed.included));
          return {
            id: dbFilter.id,
            name: dbFilter.name,
            time: dbFilter.time,
            filter: parsed,
            missingGames,
          };
        } catch {
          return null;
        }
      })
      .filter((parsed) => parsed != null);
  }, [allGames, dbFilters]);
  return (
    <Modal
      padding={0}
      fullScreen={false}
      centered={true}
      onClose={onClose}
      opened={true}
      title={
        <Group gap="sm" p="sm">
          {mode.type !== "select" && (
            <ActionIcon
              variant="subtle"
              onClick={() => setMode({ type: "select" })}
            >
              <IconArrowLeft size={18} />
            </ActionIcon>
          )}
          <Title order={4}>
            {mode.type === "select"
              ? "Select Filters"
              : mode.type === "create"
                ? "Create Filters"
                : mode.type === "edit"
                  ? "Edit Filters"
                  : "Import Filters"}
          </Title>
        </Group>
      }
    >
      {mode.type === "select" && (
        <FiltersTable
          filters={filters}
          setMode={setMode}
          onClose={onClose}
          checkedIds={checkedIds}
          setCheckedIds={setCheckedIds}
          setFilterInfo={setFilterInfo}
          allGames={allGames}
        />
      )}
      {mode.type === "create" && (
        <FiltersCreate pasta={pasta} setMode={setMode} allGames={allGames} />
      )}
      {mode.type === "import" && <FiltersImport setMode={setMode} />}
      {mode.type === "edit" && (
        <FiltersEdit
          setMode={setMode}
          filter={mode.filter}
          pasta={pasta}
          allGames={allGames}
        />
      )}
    </Modal>
  );
}
