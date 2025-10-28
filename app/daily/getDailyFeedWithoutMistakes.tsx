// if a square has its color changed from X to Y then back to X within 5 seconds,
// it's considered a mistake and both changes are removed
// bingosync also sometimes includes the same item in the the feed with very

import { DailyFeedRow } from "../db";
import getFeedWithDuration from "./getFeedWithDuration";

function getFeedWithoutDuplicates(
    feed: ReadonlyArray<DailyFeedRow>
): ReadonlyArray<DailyFeedRow> {
    return feed.filter((item, idx) => {
        if (idx === 0) {
            return true;
        }
        const prevItem = feed[idx - 1];
        return (
            prevItem.type === item.type &&
            prevItem.squareIndex === item.squareIndex
        );
    });
}

export default function getDailyFeedWithoutMistakes(
    feed: ReadonlyArray<DailyFeedRow>
): ReadonlyArray<DailyFeedRow> {
    const withouDuplicates = getFeedWithoutDuplicates(feed);
    // pair each feed item with the elapsed time on the timer when it happened
    let accumulatedDuration = -60000;
    let curStartTime: null | number = null;
    let thisDuration = 0;

    const withDuration = getFeedWithDuration(feed);

    const changesBySquare: [number, DailyFeedRow][][] = Array(25)
        .fill(null)
        .map((_) => []);
    withDuration.forEach((pair) => {
        if (pair[1].type === "mark" || pair[1].type === "clear") {
            changesBySquare[pair[1].squareIndex ?? 0].push(pair);
        }
    });
    changesBySquare.forEach((changesForSquare) =>
        removeFeedMistakesForSquare(changesForSquare)
    );
    const allChanges = changesBySquare.flat().map(pair => pair[1]).concat(
        feed.filter(item => item.type !== "clear" && item.type !== "mark")
    );
    allChanges.sort((x, y) => x.time - y.time);
    return allChanges;
}

// changes must ALL CORRESPOND TO THE SAME SQUARE and be ordered
// chronologically
function removeFeedMistakesForSquare(feedWithDuration: [number, DailyFeedRow][]): void {
    // starting from the end, we check PAIRS of changes. If the pair
    // updates the color from X to Y to X **AND** the time difference
    // between the two items in the pair is < 5 seconds, assume that
    // the first item in the pair was a mistake and the second item
    // corrects it.
    // Since we're looking at pairs, start at the next-to-last item
    let indexOfFirstItem = feedWithDuration.length - 2;
    while (indexOfFirstItem >= 0) {
        const timeDiff =
            feedWithDuration[indexOfFirstItem + 1][0] - feedWithDuration[indexOfFirstItem][0];
        const prevIsMarked = indexOfFirstItem > 0
            ? feedWithDuration[indexOfFirstItem - 1][1].type === "mark"
            : false;
        // changes happened within 6 seconds, and second change canceled out
        // the first change. So we can remove it.
        if (timeDiff < 5000 && prevIsMarked === (feedWithDuration[indexOfFirstItem + 1][1].type === "mark")) {
            // remove the item at indexOfFirstItem and the one after
            feedWithDuration.splice(indexOfFirstItem, 2);
            // rewind 2 so we're looking at the first item in another pair
            indexOfFirstItem -= 2;
        } else {
            indexOfFirstItem -= 1;
        }
    }
}