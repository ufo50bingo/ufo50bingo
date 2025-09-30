import getSql from "../getSql";
import { Match } from "./Matches";
import { BingosyncColor } from "./parseBingosyncData";

export const MATCH_FIELDS = getSql()`
  id,
  name,
  EXTRACT(EPOCH FROM date_created)::INTEGER as date_created,
  variant,
  is_custom,
  winner_name,
  winner_color,
  winner_score,
  winner_bingo,
  opponent_name,
  opponent_color,
  opponent_score,
  board_json,
  changelog_json,
  is_board_visible,
  vod_url,
  vod_match_start_seconds,
  analysis_seconds,
  league_season,
  league_tier,
  league_week,
  league_p1,
  league_p2`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getMatchFromRaw(rawMatch: Record<string, any>): Match {
  const winner_name: null | undefined | string = rawMatch.winner_name;
  const winner_score: null | undefined | number = rawMatch.winner_score;
  const winner_color: null | undefined | BingosyncColor = rawMatch.winner_color;

  const opponent_name: null | undefined | string = rawMatch.opponent_name;
  const opponent_score: null | undefined | number = rawMatch.opponent_score;
  const opponent_color: null | undefined | BingosyncColor =
    rawMatch.opponent_color;

  const winner =
    winner_name != null &&
    winner_score != null &&
    winner_color != null &&
    winner_color.length > 0
      ? { name: winner_name, score: winner_score, color: winner_color }
      : null;

  const opponent =
    opponent_name != null &&
    opponent_score != null &&
    opponent_color != null &&
    opponent_color.length > 0
      ? { name: opponent_name, score: opponent_score, color: opponent_color }
      : null;

  let vod = null;
  if (rawMatch.vod_url != null && rawMatch.vod_url != "") {
    vod = {
      url: rawMatch.vod_url,
      startSeconds: rawMatch.vod_match_start_seconds ?? null,
    };
  }

  let leagueInfo = null;
  if (
    rawMatch.league_season != null &&
    rawMatch.league_tier != null &&
    rawMatch.league_week != null &&
    rawMatch.league_p1 != null &&
    rawMatch.league_p2 != null
  ) {
    leagueInfo = {
      season: rawMatch.league_season,
      tier: rawMatch.league_tier,
      week: rawMatch.league_week,
      p1: rawMatch.league_p1,
      p2: rawMatch.league_p2,
    };
  }
  return {
    id: rawMatch.id,
    name: rawMatch.name,
    dateCreated: rawMatch.date_created,
    variant: rawMatch.variant,
    isCustom: rawMatch.is_custom,
    winner,
    opponent,
    hasBingo: rawMatch.winner_bingo === true,
    boardJson: rawMatch.board_json,
    changelogJson: rawMatch.changelog_json,
    isBoardVisible: rawMatch.is_board_visible,
    analysisSeconds: rawMatch.analysis_seconds ?? 60,
    vod,
    leagueInfo,
  };
}
