import { UFOGoal } from "./generator/getFlatGoals";
import compareByDefault from "./goals/compareByDefault";
import { STANDARD_UFO } from "./pastas/standardUfo";

export const ORDERED_PROPER_GAMES = [
  "barbuta",
  "bughunter",
  "ninpek",
  "paintchase",
  "magicgarden",
  "mortol",
  "velgress",
  "planetzoldath",
  "attactics",
  "devilition",
  "kickclub",
  "avianos",
  "mooncat",
  "bushidoball",
  "blockkoala",
  "camouflage",
  "campanella",
  "golfaria",
  "thebigbellrace",
  "warptank",
  "waldorfsjourney",
  "porgy",
  "oniondelivery",
  "caramelcaramel",
  "partyhouse",
  "hotfoot",
  "divers",
  "railheist",
  "vainger",
  "rockonisland",
  "pingolf",
  "mortolii",
  "fisthell",
  "overbold",
  "campanella2",
  "hypercontender",
  "valbrace",
  "rakshasa",
  "starwaspir",
  "grimstone",
  "lordsofdiskonia",
  "nightmanor",
  "elfazarshat",
  "pilotquest",
  "miniandmax",
  "combatants",
  "quibblerace",
  "seasidedrive",
  "campanella3",
  "cyberowls",
] as const;

export const ORDERED_GAMES = [...ORDERED_PROPER_GAMES, "general"] as const;
export const ORDERED_SUBCATEGORIES: ReadonlyArray<string> = [
  ...ORDERED_PROPER_GAMES,
  "gift",
  "goldcherry",
  "theme",
  "bosslevel",
  "collectathon",
];
export type ProperGame = (typeof ORDERED_PROPER_GAMES)[number];
export type Game = (typeof ORDERED_GAMES)[number];

export const GAME_NAMES = {
  barbuta: "Barbuta",
  bughunter: "Bug Hunter",
  ninpek: "Ninpek",
  paintchase: "Paint Chase",
  magicgarden: "Magic Garden",
  mortol: "Mortol",
  velgress: "Velgress",
  planetzoldath: "Planet Zoldath",
  attactics: "Attactics",
  devilition: "Devilition",
  kickclub: "Kick Club",
  avianos: "Avianos",
  mooncat: "Mooncat",
  bushidoball: "Bushido Ball",
  blockkoala: "Block Koala",
  camouflage: "Camouflage",
  campanella: "Campanella",
  golfaria: "Golfaria",
  thebigbellrace: "The Big Bell Race",
  warptank: "Warptank",
  waldorfsjourney: "Waldorf's Journey",
  porgy: "Porgy",
  oniondelivery: "Onion Delivery",
  caramelcaramel: "Caramel Caramel",
  partyhouse: "Party House",
  hotfoot: "Hot Foot",
  divers: "Divers",
  railheist: "Rail Heist",
  vainger: "Vainger",
  rockonisland: "Rock On! Island",
  pingolf: "Pingolf",
  mortolii: "Mortol II",
  fisthell: "Fist Hell",
  overbold: "Overbold",
  campanella2: "Campanella 2",
  hypercontender: "Hyper Contender",
  valbrace: "Valbrace",
  rakshasa: "Rakshasa",
  starwaspir: "Star Waspir",
  grimstone: "Grimstone",
  lordsofdiskonia: "Lords of Diskonia",
  nightmanor: "Night Manor",
  elfazarshat: "Elfazar's Hat",
  pilotquest: "Pilot Quest",
  miniandmax: "Mini & Max",
  combatants: "Combatants",
  quibblerace: "Quibble Race",
  seasidedrive: "Seaside Drive",
  campanella3: "Campanella 3",
  cyberowls: "Cyber Owls",
  general: "General",
} as const;

export const SUBCATEGORY_NAMES = {
  ...GAME_NAMES,
  gift: "Gift",
  goldcherry: "Gold/Cherry",
  collectathon: "Collectathon",
  theme: "Theme",
  bosslevel: "Boss/Level",
} as const;

export const ORDERED_DIFFICULTY = [
  "easy",
  "medium",
  "hard",
  "veryhard",
  "general",
] as const;
export type Difficulty = (typeof ORDERED_DIFFICULTY)[number];
type StandardDifficulty = keyof typeof STANDARD_UFO.goals;

// verify that StandardDifficulty and Difficulty match
const difficulty: Difficulty = "easy";
const standardDifficulty: StandardDifficulty = "easy";
const _t1: StandardDifficulty = difficulty;
const _t2: Difficulty = standardDifficulty;

export type StandardSubcategory =
  | keyof typeof STANDARD_UFO.goals.easy
  | keyof typeof STANDARD_UFO.goals.general;

export const DIFFICULTY_NAMES = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
  veryhard: "Very Hard",
  general: "General",
} as const;

// verify that subcategories match
const cat1: keyof typeof SUBCATEGORY_NAMES = "barbuta";
const cat2: StandardSubcategory = "barbuta";
const _t3: StandardSubcategory = cat1;
const _t4: keyof typeof SUBCATEGORY_NAMES = cat2;

export interface StandardGoal {
  name: string;
  subcategory: StandardSubcategory;
  category: Difficulty;
}

// const FLAT_GOALS: Array<StandardGoal> = [];
// Object.keys(STANDARD_UFO.goals).forEach((untypedDifficulty) => {
//   const difficulty = untypedDifficulty as Difficulty;
//   const subcatToGoals = STANDARD_UFO.goals[difficulty];
//   Object.entries(subcatToGoals).forEach(
//     ([untypedSubcategory, untypedGoals]) => {
//       const subcategory = untypedSubcategory as StandardSubcategory;
//       const goals = untypedGoals as ReadonlyArray<string>;
//       goals.forEach((goal) => {
//         FLAT_GOALS.push({
//           name: goal,
//           subcategory,
//           difficulty,
//         });
//       });
//     }
//   );
// });

// this also verifies that all Game and Difficulty options are consistent between the ordered
// arrays in this file and the values in STANDARD
// export const SORTED_FLAT_GOALS: ReadonlyArray<StandardGoal> =
//   FLAT_GOALS.toSorted(compareByDefault);

export function compareByDifficulty(a: UFOGoal, b: UFOGoal): number {
  return (
    ORDERED_DIFFICULTY.indexOf(a.category as Difficulty) -
    ORDERED_DIFFICULTY.indexOf(b.category as Difficulty)
  );
}
