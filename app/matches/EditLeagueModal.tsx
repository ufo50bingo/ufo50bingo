import {
  Alert,
  Button,
  Group,
  Modal,
  Select,
  Stack,
  TextInput,
} from "@mantine/core";
import { Match } from "./Matches";
import { useState } from "react";
import {
  ALL_PLAYERS,
  getCurrentWeek,
  PLAYER_TO_TIER,
  WEEKS,
} from "../createboard/leagueConstants";
import updateLeagueInfo, { LeagueInfoUpdate } from "./updateLeagueInfo";

type Props = {
  isMobile: boolean;
  match: Match;
  onClose: () => void;
};

const CURRENT_SEASON = 2;
const SEASONS = ["Season 2", "Non-League"] as const;
type Season = (typeof SEASONS)[number];

function getSeasonNumber(season: Season): null | number {
  switch (season) {
    case "Season 2":
      return 2;
    case "Non-League":
      return null;
  }
}

function getSeason(num: null | number): null | Season {
  switch (num) {
    case 2:
      return "Season 2";
    case null:
      return "Non-League";
    default:
      return null;
  }
}

export default function EditLeagueModal({ isMobile, match, onClose }: Props) {
  const [isSaving, setIsSaving] = useState(false);

  const { leagueInfo } = match;

  const [season, setSeason] = useState<null | Season>(
    getSeason(leagueInfo?.season ?? null)
  );
  const [week, setWeek] = useState<null | string>(
    leagueInfo?.week ?? getCurrentWeek()
  );
  const [p1, setP1] = useState<null | string>(leagueInfo?.p1 ?? null);
  const [p2, setP2] = useState<null | string>(leagueInfo?.p2 ?? null);
  const [name, setName] = useState<string>(match.name);

  const p1Tier = p1 != null ? PLAYER_TO_TIER[p1] : null;
  const p2Tier = p2 != null ? PLAYER_TO_TIER[p2] : null;

  const tierMismatch = p1 != null && p2 != null && p1Tier != p2Tier;

  const isStandard = match.variant === "Standard" && match.isCustom === false;
  return (
    <Modal
      fullScreen={isMobile}
      centered={true}
      onClose={onClose}
      opened={true}
      title={`Edit League Info for ${match.name}`}
      size={800}
    >
      {season == null ? (
        <Alert
          variant="light"
          color="red"
          title="You cannot edit matches from past seasons!"
        />
      ) : !isStandard ? (
        <Alert
          variant="light"
          color="red"
          title="You can only edit Standard matches."
        />
      ) : (
        <Stack>
          <Select
            label="Season"
            data={SEASONS}
            value={season}
            onChange={(newSeason) =>
              setSeason(newSeason as unknown as null | Season)
            }
            placeholder="Filter by season"
          />

          {season === "Non-League" ? (
            <TextInput
              label="Name"
              onChange={(event) => setName(event.target.value)}
              value={name}
            />
          ) : (
            <>
              <Select
                label="Week"
                data={WEEKS}
                value={week}
                onChange={setWeek}
              />
              <Select
                spellCheck={false}
                searchable={true}
                data={ALL_PLAYERS}
                label="First player"
                value={p1}
                onChange={setP1}
              />
              <Select
                spellCheck={false}
                searchable={true}
                data={ALL_PLAYERS}
                label="Second player"
                value={p2}
                onChange={setP2}
              />
              {tierMismatch && (
                <Alert
                  variant="light"
                  color="red"
                  title={`${p1} (${p1Tier}) and ${p2} (${p2Tier}) are in different tiers!`}
                >
                  League matches must be between players in the same tier.
                </Alert>
              )}
            </>
          )}
          <Group mt="lg" justify="flex-end">
            <Button
              disabled={
                isSaving ||
                (season === "Season 2" && tierMismatch) ||
                week == null ||
                p1 == null ||
                p2 == null ||
                (season === "Non-League" && name == null) ||
                name === ""
              }
              onClick={async () => {
                try {
                  setIsSaving(true);
                  const getUpdateInfo = (): LeagueInfoUpdate => {
                    if (season === "Non-League") {
                      return { type: "nonleague", name };
                    }
                    if (
                      p1Tier == null ||
                      week == null ||
                      p1 == null ||
                      p2 == null
                    ) {
                      throw new Error("Failed to update information");
                    }
                    return {
                      type: "league",
                      // TODO: Add a CURRENT_SEASON constant or something like that
                      season: 2,
                      tier: p1Tier,
                      week,
                      p1,
                      p2,
                    };
                  };
                  await updateLeagueInfo(match.id, getUpdateInfo());
                  onClose();
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
      )}
    </Modal>
  );
}
