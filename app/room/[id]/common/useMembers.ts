import { NewFeed } from "@/app/fetchFeed";
import { BingosyncColor } from "@/app/matches/parseBingosyncData";
import { useMemo } from "react";

export interface CasterMember {
  userId: number;
  name: string;
  isInvite: boolean;
}

export interface PlayerMember extends CasterMember {
  color: BingosyncColor;
}

export type GenericMember = {
  userId: number;
  name: string;
  overrideName: null | string;
  color: null | BingosyncColor;
  initialTime: number;
  isInvite: boolean;
};

export default function useMembers(feed: NewFeed): {
  players: ReadonlyArray<PlayerMember>;
  casters: ReadonlyArray<CasterMember>;
  allMembers: ReadonlyMap<number, GenericMember>;
} {
  return useMemo(() => {
    const allMembers: Map<number, GenericMember> = new Map();
    let lastPlayerOrder: null | ReadonlyArray<number> = null;
    for (const item of feed) {
      if (item.type === "member") {
        const existing = allMembers.get(item.userId);
        allMembers.set(item.userId, {
          userId: item.userId,
          name: item.name,
          overrideName: item.overrideName,
          color: item.playerColor,
          isInvite: item.isInvite,
          initialTime: existing?.initialTime ?? item.time,
        });
      } else if (item.type === "player_order") {
        lastPlayerOrder = item.orderedIds;
      }
    }
    const sortedMembers = [...allMembers.values()];
    sortedMembers.sort((a, b) => {
      if (lastPlayerOrder != null) {
        const aIdx = lastPlayerOrder.findIndex((id) => a.userId === id);
        const bIdx = lastPlayerOrder.findIndex((id) => b.userId === id);

        if (aIdx !== bIdx) {
          if (aIdx === -1) {
            return 1;
          } else if (bIdx === -1) {
            return -1;
          } else {
            return aIdx - bIdx;
          }
        }
      }
      const timeDiff = a.initialTime - b.initialTime;
      if (timeDiff !== 0) {
        return timeDiff;
      }
      return a.name.localeCompare(b.name);
    });
    const players: Array<PlayerMember> = [];
    const casters: Array<CasterMember> = [];
    for (const member of sortedMembers) {
      if (member.color != null) {
        players.push({
          name: member.overrideName ?? member.name,
          userId: member.userId,
          isInvite: member.isInvite,
          color: member.color,
        });
      } else {
        casters.push({
          name: member.overrideName ?? member.name,
          userId: member.userId,
          isInvite: member.isInvite,
        });
      }
    }
    return { players, casters, allMembers };
  }, [feed]);
}
