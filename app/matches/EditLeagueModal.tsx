import { Alert, Modal, Stack } from "@mantine/core";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FullParsedGame } from "../fetchFeed";
import { WEEK } from "./week";

type Props = {
  matchesUrl: string | null;
  isMobile: boolean;
  match: FullParsedGame;
  onClose: () => void;
};

export default function EditLeagueModal({ isMobile, match, onClose }: Props) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const { leagueGame } = match.game;

  const [season, setSeason] = useState<null | number>(
    leagueGame?.season ?? null,
  );
  const [week, setWeek] = useState<null | WEEK>(
    leagueGame?.week ?? WEEK.WEEK_1,
  );
  // const [p1, setP1] = useState<null | string>(league?.p1 ?? null);
  // const [p2, setP2] = useState<null | string>(leagueInfo?.p2 ?? null);
  const [name, setName] = useState<string>(match.game.name ?? "");
  const [gameNumber, setGameNumber] = useState<number | null>(
    leagueGame?.gameNumber ?? null,
  );

  // const p1Tier = p1 != null ? PLAYER_TO_TIER[p1] : null;
  // const p2Tier = p2 != null ? PLAYER_TO_TIER[p2] : null;

  // const tierMismatch = p1 != null && p2 != null && p1Tier != p2Tier;

  const isStandard =
    match.game.variant === "Standard" &&
    match.game.isCustom === false &&
    match.game.isDraft === false &&
    match.game.isLockout === true;
  return (
    <Modal
      fullScreen={isMobile}
      centered={true}
      onClose={onClose}
      opened={true}
      title={`Edit League Info for ${match.game.name}`}
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
          {/* <Select
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
              <Checkbox
                checked={gameNumber != null}
                onChange={(event) =>
                  event.currentTarget.checked
                    ? setGameNumber(1)
                    : setGameNumber(null)
                }
                label="Is part of multi-game series"
              />
              {gameNumber != null && (
                <NumberInput
                  label="Game number"
                  value={gameNumber}
                  onChange={(newValue) => setGameNumber(newValue as number)}
                  min={1}
                  max={99}
                  allowNegative={false}
                  allowDecimal={false}
                />
              )}
            </>
          )}
          <Group mt="lg" justify="flex-end">
            <Button
              disabled={
                isSaving ||
                (season === "Season 4" && tierMismatch) ||
                week == null ||
                p1 == null ||
                p2 == null ||
                (season === "Non-League" && name == null) ||
                name === ""
              }
              onClick={async () => {
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
                    season: LEAGUE_SEASON!,
                    tier: p1Tier,
                    week,
                    p1,
                    p2,
                    game: gameNumber,
                  };
                };
                await runWithMaybeRefresh(
                  router,
                  matchesUrl,
                  async () => {
                    await updateLeagueInfo(
                      match.id,
                      match.leagueInfo?.season,
                      getUpdateInfo(),
                    );
                    onClose();
                    return true;
                  },
                  () => setIsSaving(false),
                );
              }}
              color="green"
            >
              Save
            </Button>
          </Group> */}
        </Stack>
      )}
    </Modal>
  );
}
