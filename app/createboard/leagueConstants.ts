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
  {
    name: "Thrid Place",
    end: null,
  },
  {
    name: "Bye",
    end: null,
  },
];

export const WEEKS = WEEK_DATA.map((data) => data.name);

export function getCurrentWeek(): null | string {
  return WEEK_DATA.find((data) => data.end != null && data.end * 1000 > Date.now())?.name ?? null;
}

const TIER_TO_PLAYERS: { [tier: string]: ReadonlyArray<string> } = {
  A: [
    "chocolatecake5000",
    "Cosmoing",
    "Flick",
    "glove",
    "Kanvas",
    "Khana",
    "Matt",
    "RedRobot",
    "RPM",
    "Spooty",
    "stnfwds",
    "Tyler233",
    "Uncle Slam",
    "Val1407",
  ],
  B1: [
    "A Ghost House",
    "Aranq",
    "CG65",
    "Dom",
    "Flesh177",
    "frogmoss10",
    "Hugo",
    "Keeny Peeny Weeny",
    "Marshmallow",
    "MBI",
    "Phi",
    "Pine",
    "Rollnaway",
    "ScouSin",
    "sio",
    "WinnerBit",
  ],
  B2: [
    "A guy",
    "adoor",
    "Burgerboy",
    "CuthBucket",
    "deccy",
    "Grape",
    "heckaroni",
    "ivanilos",
    "Lizstar",
    "Luminant",
    "PigeonPat27",
    "Stew",
    "thumpus",
    "trootyfruity",
    "Tutes",
    "Zuzu",
  ],
  C1: [
    "10Dads",
    "Aha! Eeeeerr Uhm Oh-oh!",
    "amarettosis",
    "boardsofhannahda",
    "bosco!!",
    "dahdumbguy",
    "goose",
    "Johnathan",
    "Morzis",
    "Nitro",
    "smo",
    "zachary20XX",
  ],
  C2: [
    "aBeautifulDave",
    "Augite",
    "Crumble",
    "Firelion348",
    "Hewhoamareismyself",
    "ifdots",
    "Julie",
    "Kami",
    "Parchment",
    "Sleepy",
    "Vanstrummer",
  ],
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

export const ALL_TIERS = Object.keys(TIER_TO_PLAYERS);

export const IS_LEAGUE_DISABLED = false;
