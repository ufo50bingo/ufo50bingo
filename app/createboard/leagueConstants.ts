const WEEK_1_END = 1789390800;
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
  {
    name: "Third Place",
    end: null,
  },
  {
    name: "Bye",
    end: null,
  },
];

export const WEEKS = WEEK_DATA.map((data) => data.name);

export function getCurrentWeek(): null | string {
  return (
    WEEK_DATA.find((data) => data.end != null && data.end * 1000 > Date.now())
      ?.name ?? null
  );
}

const TIER_TO_PLAYERS: { [tier: string]: ReadonlyArray<string> } = {
  A1: [
    "Aranq",
    "Cosmoing",
    "Hugo",
    "keeny",
    "khana",
    "Matt",
    "morraconda",
    "Red",
    "Uncle Slam",
    "Violett",
  ],
  A2: [
    "Flesh177",
    "glove",
    "goose",
    "Kanvas",
    "Pine",
    "sio",
    "stnfwds",
    "tutes",
    "Val",
    "WinnerBit",
  ],
  B1: [
    "Domme",
    "Firelion",
    "Glace",
    "heckaroni",
    "Hewhoamareismyself",
    "Lizstar",
    "Parchment",
    "Tufwfo",
    "Tyler233",
    "zachary",
  ],
  B2: [
    "ace",
    "Boards of Hannahda",
    "bosco!!",
    "Declined",
    "frozenflygone",
    "Madotsuki",
    "Nia",
    "ScoutPilgrim",
    "Sunshine",
    "Wizard.Exe",
  ],
  C1: [
    "amarettosis",
    "Crumble",
    "Dahdumbguy",
    "Eman",
    "Endercart",
    "Goof",
    "Nitro",
    "PigeonPat",
    "PresJPolk",
    "samantha",
    "Smo",
    "thumpus",
  ],
  C2: [
    "August",
    "Eden",
    "Ghodyst",
    "Gr",
    "jukemate",
    "Mallow",
    "Pauline",
    "retrolivia",
    "samtwo",
    "sandy",
    "Vex",
    "Yavi",
  ],
} as const;

export const PLAYER_TO_TIER: { [player: string]: string } = {};
Object.keys(TIER_TO_PLAYERS).forEach((tier) => {
  TIER_TO_PLAYERS[tier].forEach((player) => {
    PLAYER_TO_TIER[player] = tier;
  });
});

export const ALL_PLAYERS: ReadonlyArray<string> = Object.keys(
  PLAYER_TO_TIER,
).toSorted((a, b) => a.toLocaleLowerCase().localeCompare(b.toLowerCase()));

export const LEAGUE_SEASON: null | number = 4;
export const LATEST_SEASON: number = 4;
