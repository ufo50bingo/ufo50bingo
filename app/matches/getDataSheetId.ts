const SEASON_SHEETS = [
  "1V5-vbfdSoK8tBQa8bKAQCpGFslXlgwDpOeQryaitJ4k", // season 1
  "1ol2G0VhzvXmgcGvMnQJuIMTl6x4KEpj3-cW_ot93-r4", // season 2
  "12QxCeOhHnmnoRQhiSmD56dPSl3rNnw2mfDt7qScz9Ds", // season 3
];

const NON_LEAGUE_SHEET = "1ltJGLwAM_PE4yVtl5QnFWKhfYQ5lYTS7ITax2EpCTAw";

export default function getDataSheetId(
  season: null | undefined | number,
): string {
  return season == null ? NON_LEAGUE_SHEET : SEASON_SHEETS[season - 1];
}
