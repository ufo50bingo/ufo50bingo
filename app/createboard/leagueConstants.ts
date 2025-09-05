const WEEK_1_END = 1757941200;
const SEC_IN_WEEK = 7 * 24 * 60 * 60;

const WEEK_DATA = [
  {
    name: "Week 1",
    end: WEEK_1_END,
  },
  {
    name: "Week 2",
    end: WEEK_1_END + SEC_IN_WEEK,
  },
  {
    name: "Week 3",
    end: WEEK_1_END + 2 * SEC_IN_WEEK,
  },
  {
    name: "Week 4",
    end: WEEK_1_END + 3 * SEC_IN_WEEK,
  },
  {
    name: "Week 5",
    end: WEEK_1_END + 4 * SEC_IN_WEEK,
  },
  {
    name: "Week 6",
    end: WEEK_1_END + 5 * SEC_IN_WEEK,
  },
  {
    name: "Week 7",
    end: WEEK_1_END + 6 * SEC_IN_WEEK,
  },
  {
    name: "Week 8",
    end: WEEK_1_END + 7 * SEC_IN_WEEK,
  },
  {
    name: "Quarterfinals",
    end: WEEK_1_END + 8 * SEC_IN_WEEK,
  },
  {
    name: "Semifinals",
    end: WEEK_1_END + 9 * SEC_IN_WEEK,
  },
  {
    name: "Championship",
    end: WEEK_1_END + 10 * SEC_IN_WEEK,
  },
];

export const WEEKS = WEEK_DATA.map((data) => data.name);

export function getCurrentWeek(): null | string {
  return WEEK_DATA.find((data) => data.end * 1000 > Date.now())?.name ?? null;
}

const TIER_TO_PLAYERS: { [tier: string]: ReadonlyArray<string> } = {
  S: ["choco", "Cosmoing", "Kanvas", "Matt", "may", "Spooty", "stnfwds", "Val"],
  A: ["Flesh", "hugo", "sio", "tutes"],
  B: ["Dom", "Ghost", "pine"],
  C: ["amarettosis", "Bosco", "Nitro", "smo"],
};

export const PLAYER_TO_TIER: { [player: string]: string } = {};
Object.keys(TIER_TO_PLAYERS).forEach((tier) => {
  TIER_TO_PLAYERS[tier].forEach((player) => {
    PLAYER_TO_TIER[player] = tier;
  });
});

export const ALL_PLAYERS: ReadonlyArray<string> = Object.keys(
  PLAYER_TO_TIER
).toSorted((a, b) => a.toLocaleLowerCase().localeCompare(b.toLowerCase()));
