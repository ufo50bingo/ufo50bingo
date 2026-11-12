import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Group,
  Loader,
  MultiSelect,
  Text,
  type OptionsFilter,
} from "@mantine/core";
import { BasicUser } from "./api/users/route";
import Fuse from "fuse.js";

async function loadCachedUsers(): Promise<ReadonlyArray<BasicUser>> {
  const result = await fetch("/api/users");
  if (!result.ok) {
    throw new Error(`Failed to load users (${result.status})`);
  }
  return (await result.json()) as ReadonlyArray<BasicUser>;
}

let cached: Promise<ReadonlyArray<BasicUser>> | null = null;
function getUsers(): Promise<ReadonlyArray<BasicUser>> {
  if (cached != null) {
    return cached;
  }
  cached = loadCachedUsers();
  return cached;
}

function useAllUsers() {
  const [users, setUsers] = useState<null | ReadonlyArray<BasicUser>>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const alreadyLoading = useRef(false);

  const load = useCallback(async () => {
    if (alreadyLoading.current) {
      return;
    }
    setIsLoading(true);
    alreadyLoading.current = true;
    setError(null);
    try {
      const users = await getUsers();
      setUsers(users);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { users, error, load, isLoading };
}

type Props = {
  selectedUserIds: ReadonlyArray<number>;
  onChange: (newSelectedUsers: ReadonlyArray<BasicUser>) => unknown;
  label?: string;
  description?: string;
  placeholder?: string;
  excludedIds?: ReadonlyArray<number>;
  disabled?: boolean;
};

export function UserTokenizer({
  selectedUserIds,
  onChange: onChangeRaw,
  label,
  description,
  placeholder = "Search users",
  excludedIds,
  disabled,
}: Props) {
  const { users, error, load, isLoading } = useAllUsers();
  const [search, setSearch] = useState("");
  const [dropdownOpened, setDropdownOpened] = useState(false);

  const hasInitialValue = selectedUserIds.length > 0;
  useEffect(() => {
    if (hasInitialValue) {
      load();
    }
  }, [hasInitialValue, load]);

  const filteredUsers = useMemo(
    () =>
      users == null
        ? null
        : users.filter(
            (u) =>
              !excludedIds?.includes(u.userId) &&
              !selectedUserIds.includes(u.userId),
          ),
    [excludedIds, selectedUserIds, users],
  );

  const data = useMemo(() => {
    if (users == null) {
      return [];
    }
    return users.map((u) => ({ value: String(u.userId), label: u.name }));
  }, [users]);

  const userIdToUser: Map<number, BasicUser> = useMemo(() => {
    if (users == null) {
      return new Map();
    }
    return new Map(users.map((u) => [u.userId, u]));
  }, [users]);

  const value = useMemo(
    () => selectedUserIds.map((id) => String(id)),
    [selectedUserIds],
  );

  const onChange = useCallback(
    (newSelectedUserIdStrs: ReadonlyArray<string>) => {
      const newSelected = newSelectedUserIdStrs
        .map((idStr) => userIdToUser.get(Number(idStr)))
        .filter((u) => u != null);
      onChangeRaw(newSelected);
    },
    [onChangeRaw, userIdToUser],
  );

  const fuse = useMemo(() => {
    if (filteredUsers == null) {
      return null;
    }
    return new Fuse(filteredUsers, {
      keys: [
        { name: "name", weight: 2 },
        { name: "username", weight: 1 },
      ],
      location: 0,
      distance: 10,
      threshold: 0.3,
      ignoreLocation: true,
      includeScore: true,
    });
  }, [filteredUsers]);

  const filter: OptionsFilter = useCallback(
    ({ search, limit }) => {
      if (fuse == null || search.trim().length < 2) {
        return [];
      }
      const searchResults = fuse.search(search);
      const hasUsername = searchResults.filter((r) => r.item.username != null);
      const missingUsername = searchResults.filter(
        (r) => r.item.username == null,
      );
      return hasUsername
        .concat(missingUsername)
        .map((r) => ({ label: r.item.name, value: String(r.item.userId) }))
        .slice(0, limit);
    },
    [fuse],
  );

  return (
    <MultiSelect
      label={label}
      description={description}
      placeholder={value.length === 0 ? placeholder : undefined}
      disabled={disabled}
      data={data}
      value={value}
      onChange={onChange}
      searchable={true}
      hidePickedOptions={true}
      selectFirstOptionOnChange={true}
      limit={8}
      filter={filter}
      searchValue={search}
      onSearchChange={(newSearch) => {
        setSearch(newSearch);
        setDropdownOpened(newSearch.trim().length > 1);
      }}
      dropdownOpened={dropdownOpened}
      onDropdownClose={() => setDropdownOpened(false)}
      onFocus={load}
      error={error}
      rightSection={isLoading ? <Loader size="xs" /> : undefined}
      nothingFoundMessage={
        search.trim().length > 0
          ? users != null
            ? `No one matches “${search.trim()}”`
            : "Loading users..."
          : undefined
      }
      renderOption={({ option }) => {
        const username = userIdToUser.get(Number(option.value))?.username;
        return (
          <Group gap="xs" wrap="nowrap">
            <Text size="sm">{option.label}</Text>
            {username != null && (
              <Text size="xs" c="dimmed">
                @{username}
              </Text>
            )}
          </Group>
        );
      }}
      comboboxProps={{
        preventPositionChangeWhenVisible: true,
      }}
    />
  );
}
