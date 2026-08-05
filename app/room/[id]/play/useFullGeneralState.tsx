import { useCallback, useEffect, useState } from "react";
import { GeneralCounts } from "../cast/CastPage";
import { CountChange, CountState } from "../cast/useSyncedState";

export default function useFullGeneralState(
    id: string,
    seed: number
): [GeneralCounts, (change: CountChange) => unknown] {
    const key = `${id}-${seed}-fullgeneral`;
    const [state, setStateRaw] = useState<GeneralCounts>({});

    const setGeneralGameCount = useCallback((change: CountChange) => {
        setStateRaw(prevState => {
            const oldGeneralState: CountState = prevState[change.goal] ?? [];
            // player num is always 0
            const oldCounts = oldGeneralState?.[0] ?? {};
            const newCounts = { ...oldCounts };
            newCounts[change.game] = change.count;
            const newGeneralState = [...oldGeneralState];
            newGeneralState[change.player_num] = newCounts;
            const newGenerals = {
                ...prevState,
                [change.goal]: newGeneralState,
            };
            if (global.window != undefined && localStorage != null) {
                try {
                    localStorage.setItem(key, JSON.stringify(newGenerals));
                } catch { }
            }
            return newGenerals;
        });
    }, []);

    // clear data on key change
    useEffect(() => {
        setStateRaw(getFromStorage(key));
    }, [key]);

    return [state, setGeneralGameCount];
}

function getFromStorage(key: string): GeneralCounts {
    if (global.window == undefined || localStorage == null) {
        return {};
    }
    const fromStorage = localStorage.getItem(key);
    if (fromStorage == null || fromStorage === "") {
        return {};
    }
    try {
        // TODO: validate??
        const parsed: GeneralCounts = JSON.parse(fromStorage);
        return parsed;
    } catch {
        return {};
    }
}