"use client";

import { useSearchParams } from "next/navigation";

export const PRACTICE_VARIANTS = {
  standard: "Standard",
  spicy: "Spicy",
  blitz: "Blitz",
  choco: "Choco",
} as const;

type PracticeVariant = keyof typeof PRACTICE_VARIANTS;

export default function usePracticeVariant(): PracticeVariant {
  const searchParams = useSearchParams();
  const practiceVariant = searchParams.get("v");
  switch (practiceVariant) {
    case "spicy":
      return "spicy";
    case "blitz":
      return "blitz";
    case "choco":
      return "choco";
    case "standard":
    default:
      return "standard";
  }
}
