"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type PracticeVariantContextValue = {
  practiceVariant: null | PracticeVariant;
  setPracticeVariant: (newPracticeVariant: PracticeVariant) => void;
};

const PracticeVariantContext = createContext<
  PracticeVariantContextValue | undefined
>(undefined);

export function PracticeVariantProvider({ children }: { children: ReactNode }) {
  const [practiceVariant, setPracticeVariant] =
    useState<null | PracticeVariant>(null);

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
  nes50: "NES 50",
} as const;

export type PracticeVariant = keyof typeof PRACTICE_VARIANTS;

export type NonStandardPracticeVariant = Exclude<PracticeVariant, "standard"> | null;

export function usePracticeVariantFull(): PracticeVariantContextValue {
  const ctx = useContext(PracticeVariantContext);
  if (ctx == null) {
    throw new Error(
      "usePracticeVariant must be used within PracticeVariantContextProvider",
    );
  }
  return ctx;
}

export function usePracticeVariant(): null | PracticeVariant {
  const ctx = usePracticeVariantFull();
  return ctx.practiceVariant;
}

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { getPracticeVariant } from "./usePracticePasta";

export function PracticeVariantInit() {
  const searchParams = useSearchParams();
  const practiceVariant = searchParams.get("v");
  const { setPracticeVariant } = usePracticeVariantFull();

  useEffect(() => {
    setPracticeVariant(getPracticeVariant(practiceVariant));
  }, [practiceVariant, setPracticeVariant]);

  return null;
}
