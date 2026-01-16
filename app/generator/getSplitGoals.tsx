import getFlatGoals, { UFOGoal } from "./getFlatGoals";
import splitAtTokens, { BaseToken, Plain, ResolvedToken } from "./splitAtTokens";
import { UFOPasta } from "./ufoGenerator";

export interface SplitGoal extends UFOGoal {
    parts: ReadonlyArray<Plain | BaseToken | ResolvedToken>;
    partiallyResolvedGoal: string;
}

const CACHE: Array<
    [
        UFOPasta,
        ReadonlyArray<SplitGoal>,
    ]
> = [];

export default function getSplitGoals(pasta: UFOPasta): ReadonlyArray<SplitGoal> {
    let cached = CACHE.find((item) => item[0] === pasta)?.[1];
    if (cached != null) {
        return cached;
    }
    const splitGoals = getFlatGoals(pasta).map((goal) => ({
        ...goal,
        parts: splitAtTokens(goal.name),
        partiallyResolvedGoal: goal.name,
    }));
    CACHE.push([pasta, splitGoals]);
    return splitGoals;
}