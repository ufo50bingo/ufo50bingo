import useLocalNumber from "../localStorage/useLocalNumber";
import { PracticeVariant } from "../PracticeVariantContext";

export default function useAttemptNumber(
  date: string,
  variant: PracticeVariant,
): [number, (newAttempt: number) => unknown] {
  const key = variant === "standard"
    ? `daily-attempt-${date}`
    : `daily-attempt-${variant}-${date}`;
  return useLocalNumber({ key, defaultValue: 0 });
}
