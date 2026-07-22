export function inferGames(resolvedGoal: string, allGames: ReadonlyArray<string>): ReadonlyArray<string> {
  const matches: Array<string> = [];
  let remaining = resolvedGoal;

  // special cases
  if (
    allGames.includes("campanella") &&
    (remaining.includes("Campanella 1/2/3") ||
      remaining.includes("Campanella 1, 2, and 3"))
  ) {
    matches.push("campanella2");
    matches.push("campanella3");
    remaining = remaining.replaceAll("Campanella 1/2/3", " ");
    remaining = remaining.replaceAll("Campanella 1, 2, and 3", " ");
  }
  if (
    allGames.includes("miniandmax") && remaining.includes("Mini & Max")
  ) {
    matches.push("minimax");
    remaining = remaining.replaceAll("Mini & Max", " ");
  }
  remaining = stripText(remaining);

  for (const candidate of allGames) {
    const stripped = stripText(candidate);
    const regex = new RegExp(stripped, "g");
    if (regex.test(remaining)) {
      matches.push(candidate);
      remaining = remaining.replace(regex, " ");
    } else {
      console.log('failed candidate', candidate, "on", remaining);
    }
  }

  return matches;
}

function stripText(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]/g, "");
}