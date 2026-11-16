import { NewFeed } from "@/app/fetchFeed";
import { useMemo } from "react";

export default function useIsEnded(feed: NewFeed): boolean {
  return useMemo(() => feed.some((item) => item.type === "end_game"), [feed]);
}
