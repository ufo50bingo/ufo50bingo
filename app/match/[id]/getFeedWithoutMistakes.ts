import { BingosyncColor } from "@/app/color";
import { NewFeed, NewFeedItem } from "@/app/fetchFeed";
import BoardState, { BoardStateParams } from "./BoardState";

// if a square has a color T -> F -> T or F -> T -> F within 5 seconds,
// it's considered a mistake and both changes are removed.
// We also remove redundant color marks, where the mark did not change
// anything
export default function getFeedWithoutMistakes(
  feed: NewFeed,
  boardStateParams: BoardStateParams,
): NewFeed {
  const finalFeed: Array<NewFeedItem | null> = [];
  const boardState = new BoardState(boardStateParams);
  // value is an array of size boardSize with either null (if this square
  // has never changed to this color) or {time, feedFinalIndex} where time
  // is the actual server time the change happened, and index is the index
  // of the corresponding item in the finalFeed
  const lastColorChangeTimeAndIndex = new Map<
    BingosyncColor,
    Array<null | { time: number; finalFeedIndex: number }>
  >();

  for (const item of feed) {
    if (item.type !== "color_mark") {
      finalFeed.push(item);
      continue;
    }
    const wasMeaningful = boardState.apply(item);
    if (!wasMeaningful) {
      continue;
    }
    let lastChanges = lastColorChangeTimeAndIndex.get(item.color);
    if (lastChanges == null) {
      lastChanges = Array(boardState.rows * boardState.cols).fill(null);
      lastColorChangeTimeAndIndex.set(item.color, lastChanges);
    }
    const lastChange = lastChanges[item.squareIndex];
    // we only get here if this item made a legitimate change to a square color
    if (lastChange != null && item.time - lastChange.time < 5) {
      finalFeed[lastChange.finalFeedIndex] = null;
      // technically there may be another change in the history, but
      // it must have been at least 5 seconds prior to the one we just
      // removed, so we can ignore it
      lastChanges[item.squareIndex] = null;
    } else {
      lastChanges[item.squareIndex] = {
        time: item.time,
        finalFeedIndex: finalFeed.length,
      };
      finalFeed.push(item);
    }
  }
  return finalFeed.filter((item) => item != null);
}
