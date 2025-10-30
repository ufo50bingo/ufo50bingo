import { useCallback, useState } from "react";

export default function useAttemptNumber(
  date: string
): [number, (newAttempt: number) => unknown] {
  const key = `daily-attempt-${date}`;
  const [attempt, setAttemptRaw] = useState<number>(() => {
    if (global.window == undefined || localStorage == null) {
      return 0;
    }
    const fromStorage = localStorage.getItem(key);
    if (fromStorage == null || fromStorage === "") {
      return 0;
    }
    return Number(fromStorage);
  });

  const setAttempt = useCallback(
    async (newAttempt: number) => {
      setAttemptRaw(newAttempt);
      if (global.window == undefined || localStorage == null) {
        return;
      }
      localStorage.setItem(key, newAttempt.toString());
    },
    [key]
  );

  return [attempt, setAttempt];
}
