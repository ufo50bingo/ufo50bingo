import { useCallback, useState } from "react";
import useLocalNumber from "../localStorage/useLocalNumber";

export default function useAttemptNumber(
  date: string
): [number, (newAttempt: number) => unknown] {
  const key = `daily-attempt-${date}`;
  return useLocalNumber({ key: `daily-attempt-${date}`, defaultValue: 0 });
}
