export const enum LEAGUE_TIER {
  A,
  A1,
  A2,
  B,
  B1,
  B2,
  C,
  C1,
  C2,
}

export const ALL_LEAGUE_TIERS: ReadonlyArray<LEAGUE_TIER> = [
  LEAGUE_TIER.A,
  LEAGUE_TIER.A1,
  LEAGUE_TIER.A2,
  LEAGUE_TIER.B,
  LEAGUE_TIER.B1,
  LEAGUE_TIER.B2,
  LEAGUE_TIER.C,
  LEAGUE_TIER.C1,
  LEAGUE_TIER.C2,
];

export function displayTier(tier: LEAGUE_TIER): string {
  switch (tier) {
    case LEAGUE_TIER.A:
      return "A";
    case LEAGUE_TIER.A1:
      return "A1";
    case LEAGUE_TIER.A2:
      return "A2";
    case LEAGUE_TIER.B:
      return "B";
    case LEAGUE_TIER.B1:
      return "B1";
    case LEAGUE_TIER.B2:
      return "B2";
    case LEAGUE_TIER.C:
      return "C";
    case LEAGUE_TIER.C1:
      return "C1";
    case LEAGUE_TIER.C2:
      return "C2";
  }
}

export function parseTier(tierStr: string): null | LEAGUE_TIER {
  return ALL_LEAGUE_TIERS.find((tier) => displayTier(tier) === tierStr) ?? null;
}
