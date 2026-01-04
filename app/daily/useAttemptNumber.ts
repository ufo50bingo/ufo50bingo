import useLocalNumber from "../localStorage/useLocalNumber";

export default function useAttemptNumber(
  date: string
): [number, (newAttempt: number) => unknown] {
  return useLocalNumber({ key: `daily-attempt-${date}`, defaultValue: 0 });
}
