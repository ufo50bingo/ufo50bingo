import { useMemo } from "react";
import { NewFeed } from "@/app/fetchFeed";
import BoardState, { BoardStateParams } from "./BoardState";

export default function useBoardState(
  feed: NewFeed,
  params: BoardStateParams,
): BoardState {
  return useMemo(() => BoardState.fromFeed(feed, params), [feed, params]);
}
