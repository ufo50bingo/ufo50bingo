import { useMemo } from "react";
import { BingosyncColor } from "../color";
import { NewFeed } from "../fetchFeed";
import getMatchResult from "../match/[id]/getMatchResult";
import { WinType } from "./matchUtil";
import { MatchTeam } from "./useTeams";

export interface MatchTeamWithResult extends MatchTeam {
  score: number;
  winType: null | WinType;
}

type Props = {
  teams: ReadonlyMap<BingosyncColor, MatchTeam>;
  feedWithoutMistakes: NewFeed;
  rows: number;
  cols: number;
  isLockout: boolean;
};

export default function useTeamsWithResults({
  teams,
  feedWithoutMistakes,
  rows,
  cols,
  isLockout,
}: Props): ReadonlyArray<MatchTeamWithResult> {
  return useMemo(() => {
    const result = getMatchResult({
      feedWithoutMistakes,
      isLockout,
      rows,
      cols,
    });
    const finalTeams: Array<MatchTeamWithResult> = result.map((res) => ({
      ...res,
      // ?? [] in case a color has no current team members
      players: teams.get(res.color)?.players ?? [],
    }));
    // in case a team has score 0
    for (const team of teams.values()) {
      if (finalTeams.find((ft) => ft.color === team.color) == null) {
        finalTeams.push({ ...team, score: 0, winType: null });
      }
    }
    return finalTeams;
  }, [cols, feedWithoutMistakes, isLockout, rows, teams]);
}
