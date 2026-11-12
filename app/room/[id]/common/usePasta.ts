import { FullParsedGame } from "@/app/fetchFeed";
import { UFOPasta } from "@/app/generator/ufoGenerator";
import { getMatchingRepoPasta } from "@/app/getMatchingRepoPasta";
import { useMemo } from "react";

export default function usePasta(game: FullParsedGame): null | UFOPasta {
  const pastaId = game.game.pastaId;
  const fetchedPasta = game.fetchedPasta;
  return useMemo(() => {
    if (pastaId == null) {
      return null;
    }
    if (fetchedPasta != null) {
      return fetchedPasta;
    }
    return getMatchingRepoPasta(pastaId);
  }, [fetchedPasta, pastaId]);
}
