"use client";

import {
  ActionIcon,
  Card,
  Group,
  MultiSelect,
  Select,
  Tooltip,
} from "@mantine/core";
import { IconEye, IconEyeOff } from "@tabler/icons-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import { useAppContext } from "../AppContextProvider";
import { UserTokenizer } from "../UserTokenizer";
import { BasicUser } from "../api/users/route";
import { LATEST_SEASON } from "../createboard/leagueConstants";
import { ALL_LEAGUE_TIERS, displayTier } from "./tier";
import range from "../generator/range";

const NON_LEAGUE_SEASON = "0";

const SEASON_OPTIONS = [
  ...range(LATEST_SEASON).map((index) => {
    const season = index + 1;
    return { value: String(season), label: `Season ${season}` };
  }),
  { value: NON_LEAGUE_SEASON, label: "Non-League" },
];

const TIER_OPTIONS = ALL_LEAGUE_TIERS.map((tier) => {
  const tierStr = displayTier(tier);
  return { value: tierStr, label: tierStr };
});

function parseUserIds(raw: string | null): ReadonlyArray<number> {
  if (raw == null || raw === "") {
    return [];
  }
  return raw
    .split(",")
    .map((idStr) => Number(idStr))
    .filter((id) => Number.isInteger(id));
}

function parseOptionValues(
  raw: string | null,
  options: ReadonlyArray<{ value: string }>,
): Array<string> {
  if (raw == null || raw === "") {
    return [];
  }
  const values = new Set(raw.split(","));
  return options
    .filter((option) => values.has(option.value))
    .map((option) => option.value);
}

export default function MatchFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { hideByDefault, setHideByDefault } = useAppContext();

  const seasonParam = searchParams.get("season");
  const season = SEASON_OPTIONS.some((option) => option.value === seasonParam)
    ? seasonParam
    : null;
  const tiersParam = searchParams.get("tiers");
  const tiers = useMemo(
    () => parseOptionValues(tiersParam, TIER_OPTIONS),
    [tiersParam],
  );
  const playersParam = searchParams.get("players");
  const castersParam = searchParams.get("casters");
  const playerIds = useMemo(() => parseUserIds(playersParam), [playersParam]);
  const casterIds = useMemo(() => parseUserIds(castersParam), [castersParam]);

  const setParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value == null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      // Changing a filter changes the set of results, so go back to page 1
      params.delete("page");
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname);
    },
    [pathname, router, searchParams],
  );

  const onPlayersChange = useCallback(
    (users: ReadonlyArray<BasicUser>) =>
      setParam("players", users.map((u) => u.userId).join(",")),
    [setParam],
  );
  const onCastersChange = useCallback(
    (users: ReadonlyArray<BasicUser>) =>
      setParam("casters", users.map((u) => u.userId).join(",")),
    [setParam],
  );

  return (
    <Card withBorder shadow="sm" radius="md" padding="sm">
      <Group align="end" gap="sm">
        <Select
          label="Season"
          placeholder="Any season"
          style={{ width: "160px" }}
          clearable={true}
          data={SEASON_OPTIONS}
          value={season}
          onChange={(newSeason) => setParam("season", newSeason)}
        />
        <MultiSelect
          label="Tier"
          placeholder={tiers.length === 0 ? "Any tier" : undefined}
          style={{ flex: 0.75, minWidth: "100px" }}
          styles={{ inputField: { minWidth: "1rem" }, pill: { flex: "none" } }}
          hidePickedOptions={true}
          data={TIER_OPTIONS}
          value={tiers}
          onChange={(newTiers) =>
            setParam(
              "tiers",
              parseOptionValues(newTiers.join(","), TIER_OPTIONS).join(","),
            )
          }
        />
        <div style={{ flex: 1, minWidth: "180px" }}>
          <UserTokenizer
            label="Players"
            placeholder="Any player"
            selectedUserIds={playerIds}
            onChange={onPlayersChange}
          />
        </div>
        <div style={{ flex: 1, minWidth: "180px" }}>
          <UserTokenizer
            label="Casters"
            placeholder="Any caster"
            selectedUserIds={casterIds}
            onChange={onCastersChange}
          />
        </div>
        <Tooltip
          label={
            hideByDefault
              ? "Results are hidden by default. Click to show them."
              : "Results are shown by default. Click to hide them."
          }
        >
          <ActionIcon
            size="input-sm"
            variant="default"
            aria-label="Hide results by default"
            aria-pressed={hideByDefault}
            onClick={() => setHideByDefault(!hideByDefault)}
          >
            {hideByDefault ? <IconEyeOff size={20} /> : <IconEye size={20} />}
          </ActionIcon>
        </Tooltip>
      </Group>
    </Card>
  );
}
