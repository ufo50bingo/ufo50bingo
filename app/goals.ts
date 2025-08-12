import { RAW_GOALS } from './rawGoals';

export const ORDERED_PROPER_GAMES = [
  'barbuta',
  'bughunter',
  'ninpek',
  'paintchase',
  'magicgarden',
  'mortol',
  'velgress',
  'planetzoldath',
  'attactics',
  'devilition',
  'kickclub',
  'avianos',
  'mooncat',
  'bushidoball',
  'blockkoala',
  'camouflage',
  'campanella',
  'golfaria',
  'thebigbellrace',
  'warptank',
  'waldorfsjourney',
  'porgy',
  'oniondelivery',
  'caramelcaramel',
  'partyhouse',
  'hotfoot',
  'divers',
  'railheist',
  'vainger',
  'rockonisland',
  'pingolf',
  'mortolii',
  'fisthell',
  'overbold',
  'campanella2',
  'hypercontender',
  'valbrace',
  'rakshasa',
  'starwaspir',
  'grimstone',
  'lordsofdiskonia',
  'nightmanor',
  'elfazarshat',
  'pilotquest',
  'miniandmax',
  'combatants',
  'quibblerace',
  'seasidedrive',
  'campanella3',
  'cyberowls',
] as const;

export const ORDERED_GAMES = [...ORDERED_PROPER_GAMES, 'general'] as const;
export type ProperGame = (typeof ORDERED_PROPER_GAMES)[number];
export type Game = (typeof ORDERED_GAMES)[number];

export const GAME_NAMES = {
  barbuta: 'Barbuta',
  bughunter: 'Bug Hunter',
  ninpek: 'Ninpek',
  paintchase: 'Paint Chase',
  magicgarden: 'Magic Garden',
  mortol: 'Mortol',
  velgress: 'Velgress',
  planetzoldath: 'Planet Zoldath',
  attactics: 'Attactics',
  devilition: 'Devilition',
  kickclub: 'Kick Club',
  avianos: 'Avianos',
  mooncat: 'Mooncat',
  bushidoball: 'Bushido Ball',
  blockkoala: 'Block Koala',
  camouflage: 'Camouflage',
  campanella: 'Campanella',
  golfaria: 'Golfaria',
  thebigbellrace: 'The Big Bell Race',
  warptank: 'Warptank',
  waldorfsjourney: "Waldorf's Journey",
  porgy: 'Porgy',
  oniondelivery: 'Onion Delivery',
  caramelcaramel: 'Caramel Caramel',
  partyhouse: 'Party House',
  hotfoot: 'Hot Foot',
  divers: 'Divers',
  railheist: 'Rail Heist',
  vainger: 'Vainger',
  rockonisland: 'Rock On! Island',
  pingolf: 'Pingolf',
  mortolii: 'Mortol II',
  fisthell: 'Fist Hell',
  overbold: 'Overbold',
  campanella2: 'Campanella 2',
  hypercontender: 'Hyper Contender',
  valbrace: 'Valbrace',
  rakshasa: 'Rakshasa',
  starwaspir: 'Star Waspir',
  grimstone: 'Grimstone',
  lordsofdiskonia: 'Lords of Diskonia',
  nightmanor: 'Night Manor',
  elfazarshat: "Elfazar's Hat",
  pilotquest: 'Pilot Quest',
  miniandmax: 'Mini & Max',
  combatants: 'Combatants',
  quibblerace: 'Quibble Race',
  seasidedrive: 'Seaside Drive',
  campanella3: 'Campanella 3',
  cyberowls: 'Cyber Owls',
  general: 'General',
} as const;

export const ORDERED_DIFFICULTY = ['easy', 'medium', 'hard', 'veryhard', 'general'] as const;
export type Difficulty = (typeof ORDERED_DIFFICULTY)[number];

export const DIFFICULTY_NAMES = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
  veryhard: 'Very Hard',
  general: 'General',
} as const;

export type GoalName = (typeof RAW_GOALS)[number][number]['name'];

export type TGoal = {
  readonly name: GoalName;
  readonly types: readonly [Game, Difficulty];
};

// this also verifies that all Game and Difficulty options are consistent between the ordered
// arrays in this file and the values in RAW_GOALS
export const SORTED_FLAT_GOALS: ReadonlyArray<TGoal> = RAW_GOALS.flat().toSorted((a, b) => {
  const gameDiff = ORDERED_GAMES.indexOf(a.types[0]) - ORDERED_GAMES.indexOf(b.types[0]);
  if (gameDiff !== 0) {
    return gameDiff;
  }
  const difficultyDiff = compareByDifficulty(a, b);
  if (difficultyDiff != 0) {
    return difficultyDiff;
  }
  return a.name.localeCompare(b.name);
});

export function compareByDifficulty(a: TGoal, b: TGoal): number {
  return ORDERED_DIFFICULTY.indexOf(a.types[1]) - ORDERED_DIFFICULTY.indexOf(b.types[1]);
}
