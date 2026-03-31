const SEASON_SHEETS = [
  "aaa", // season 1
  "aaa", // season 2
  "12QxCeOhHnmnoRQhiSmD56dPSl3rNnw2mfDt7qScz9Ds", // season 3
];

const NON_LEAGUE_SHEET = "aaa";

export default function getDataSheetId(
  season: null | undefined | number,
): string {
  return season == null ? NON_LEAGUE_SHEET : SEASON_SHEETS[season - 1];
}
