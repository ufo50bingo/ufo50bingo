import { useCallback, useState } from "react";

type SimpleGeneralState = { [goal: string]: number };

export default function useSimpleGeneralState(
    id: string,
    seed: number,
): [SimpleGeneralState, (newState: SimpleGeneralState) => unknown] {
    const key = `${id}-${seed}-simplegeneral`;

    const [state, setStateRaw] = useState<SimpleGeneralState>(() => {
        if (global.window == undefined || localStorage == null) {
            return {};
        }
        const fromStorage = localStorage.getItem(key);
        if (fromStorage == null || fromStorage === "") {
            return {};
        }
        try {
            const parsed: SimpleGeneralState = JSON.parse(fromStorage);;
            return parsed;
        } catch {
            return {};
        }
    });

    const setState = useCallback(
        async (newState: SimpleGeneralState) => {
            setStateRaw(newState);
            if (global.window == undefined || localStorage == null) {
                return;
            }
            localStorage.setItem(key, JSON.stringify(newState));
        },
        [key],
    );

    return [state, setState];
}
