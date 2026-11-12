import { useMemo } from "react";
import { BingosyncColor } from "./parseBingosyncData";
import { PlayerMember } from "../room/[id]/common/useMembers";

export type MatchTeam = {
  color: BingosyncColor;
  players: ReadonlyArray<PlayerMember>;
};

export default function useTeams(
  players: ReadonlyArray<PlayerMember>,
): ReadonlyArray<MatchTeam> {
  return useMemo(() => {
    const colorToTeam = new Map<BingosyncColor, MatchTeam>();
    for (const p of players) {
      let team = colorToTeam.get(p.color);
      if (team == null) {
        team = { color: p.color, players: [] };
        colorToTeam.set(p.color, team);
      }
      (team.players as Array<PlayerMember>).push(p);
    }
    return [...colorToTeam.values()];
  }, [players]);
}
