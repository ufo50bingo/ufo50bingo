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
