import findGoal from "../findGoal";
import { GAME_NAMES } from "../goals";
import { STANDARD_UFO } from "../pastas/standardUfo";
import {
  getMatchStartTime,
  getChangesWithoutMistakes,
  getColorToVerifiedName,
  getSquareCompletionRanges,
} from "./analyzeMatch";
import getBaseUrlAndHost from "./getBaseUrlAndHost";
import { Match } from "./Matches";
import { TBoard, Changelog } from "./parseBingosyncData";
import { setUrlAtTime } from "./vodUtil";

const DIAGONALS = [0, 6, 18, 24, 4, 8, 16, 20];
const CENTER = 12;

export default function getGsheetSyncData(
  match: Match,
): null | Array<Array<null | undefined | number | string>> {
  const vodURL = match.vod?.url;
  const vodStartSeconds = match.vod?.startSeconds;
  const boardJson = match.boardJson;
  const changelogJson = match.changelogJson;
  if (boardJson == null || changelogJson == null) {
    return null;
  }
  const board: TBoard = JSON.parse(boardJson);
  const changelog: Changelog = JSON.parse(changelogJson);
  const matchStartTime = getMatchStartTime(changelog, match.analysisSeconds);
  if (matchStartTime == null) {
    return null;
  }

  const urlAndHost = getBaseUrlAndHost(vodURL);

  const matchLink = `https://ufo50.bingo/match/${match.id}`;

  const getLink = (time: number) => {
    if (urlAndHost == null || vodStartSeconds == null) {
      return null;
    }
    const url = new URL(urlAndHost[0]);
    setUrlAtTime(urlAndHost[1], url, vodStartSeconds + time - matchStartTime);
    return url.toString();
  };

  const changes = getChangesWithoutMistakes(changelog.changes);
  let colorToVerifiedName = null;
  if (match.leagueInfo != null) {
    colorToVerifiedName = getColorToVerifiedName(
      changelog.changes,
      match.leagueInfo.p1,
      match.leagueInfo.p2,
    );
  }
  const changesWithCorrectedNames =
    colorToVerifiedName != null
      ? changes.map((change) => {
          const correctedName = colorToVerifiedName[change.color];
          return {
            ...change,
            name: correctedName ?? change.name,
          };
        })
      : changes;
  const ranges = getSquareCompletionRanges(
    matchStartTime,
    changesWithCorrectedNames,
  );
  const completionOrder = ranges
    .map((range, squareIndex) => ({ range, squareIndex }))
    .filter(({ range, squareIndex: _squareIndex }) => range != null)
    .toSorted((a, b) => (a.range![2] ?? 0) - (b.range![2] ?? 0))
    .map(({ range: _range, squareIndex }) => squareIndex);
  return ranges.map((range, squareIndex) => {
    const goal = board[squareIndex].name;
    const player = range?.[0];
    // For League, first columns are

    // Week
    // Tier
    // Game number
    // Player 1
    // Player 2

    // For Non-League, first column is
    // Name

    // Shared columns are:

    // Date
    // Completed By
    // Game
    // Goal
    // Source goal
    // Time (mins)
    // Time after match start
    // Completion order
    // Square type
    // Start
    // End
    // Match Link
    // Unixtime
    const order = completionOrder.indexOf(squareIndex);
    const remainingColumns = [
      new Date(match.dateCreated * 1000).toLocaleDateString("en-US", {
        timeZone: "America/New_York",
      }),
      player,
      getGameForGoal(goal),
      goal,
      findGoal(goal, STANDARD_UFO)?.goal ?? goal,
      range != null ? (range[2] - range[1]) / 60 : null,
      range != null ? (range[2] - matchStartTime) / 60 : null,
      order !== -1 ? order + 1 : null,
      CENTER === squareIndex
        ? "Center"
        : DIAGONALS.includes(squareIndex)
          ? "Diagonal"
          : "Other",
      range != null ? getLink(range[1]) : null,
      range != null ? getLink(range[2]) : null,
      matchLink,
      match.dateCreated,
    ];
    return match.leagueInfo?.season != null
      ? [
          match.leagueInfo?.week,
          match.leagueInfo?.tier,
          match.leagueInfo?.game,
          match.leagueInfo?.p1,
          match.leagueInfo?.p2,
          ...remainingColumns,
        ]
      : [match.name, ...remainingColumns];
  });
}

const GAME_NAMES_STRINGS: { [strippedName: string]: string } = GAME_NAMES;
function getGameForGoal(goal: string): string {
  const beforeColon = goal.split(":")[0];
  const search = beforeColon.toLowerCase().replace(/[^0-9a-z]/gi, "");
  const game = search === "minimax" ? "Mini & Max" : GAME_NAMES_STRINGS[search];
  return game ?? "General";
}
