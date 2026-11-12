import { NewFeed } from "@/app/fetchFeed";
import { BingosyncColor } from "@/app/matches/parseBingosyncData";
import { useMemo } from "react";

type GameMember = {
  readonly playerColor: null | BingosyncColor;
  readonly isInvite: boolean;
  readonly name: string;
};

export type GameMembers = ReadonlyMap<number, GameMember>;

export default function useMembers(feed: NewFeed): GameMembers {
  return useMemo(() => {
    const members = new Map<number, GameMember>();
    for (const item of feed) {
      if (item.type === "member") {
        members.set(item.userId, {
          name: item.name,
          playerColor: item.playerColor,
          isInvite: item.isInvite,
        });
      }
    }
    return members;
  }, [feed]);
}
