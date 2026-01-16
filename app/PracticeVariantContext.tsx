"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type PracticeVariantContextValue = {
  practiceVariant: PracticeVariant;
  setPracticeVariant: (newPracticeVariant: PracticeVariant) => void;
};

const PracticeVariantContext = createContext<
  PracticeVariantContextValue | undefined
>(undefined);

export function PracticeVariantProvider({ children }: { children: ReactNode }) {
  const [practiceVariant, setPracticeVariant] =
    useState<PracticeVariant>("standard");

  return (
    <PracticeVariantContext.Provider
      value={{ practiceVariant, setPracticeVariant }}
    >
      {children}
    </PracticeVariantContext.Provider>
  );
}

export const PRACTICE_VARIANTS = {
  standard: "Standard",
  spicy: "Spicy",
  blitz: "Blitz",
  choco: "Choco",
} as const;

export type PracticeVariant = keyof typeof PRACTICE_VARIANTS;

export function usePracticeVariantFull(): PracticeVariantContextValue {
  const ctx = useContext(PracticeVariantContext);
  if (ctx == null) {
    throw new Error(
      "usePracticeVariant must be used within PracticeVariantContextProvider"
    );
  }
  return ctx;
}

export function usePracticeVariant(): PracticeVariant {
  const ctx = usePracticeVariantFull();
  return ctx.practiceVariant;
}

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export function PracticeVariantInit() {
  const searchParams = useSearchParams();
  const practiceVariant = searchParams.get("v");
  const { setPracticeVariant } = usePracticeVariantFull();

  useEffect(() => {
    switch (practiceVariant) {
      case "spicy":
        setPracticeVariant("spicy");
        break;
      case "blitz":
        setPracticeVariant("blitz");
        break;
      case "choco":
        setPracticeVariant("choco");
        break;
      case "standard":
      default:
        setPracticeVariant("standard");
        break;
    }
  }, [practiceVariant, setPracticeVariant]);

  return null;
}
