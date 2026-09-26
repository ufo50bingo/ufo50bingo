"use client";

import { createContext, useContext, useMemo } from "react";
import useLocalBool from "../localStorage/useLocalBool";

type ShouldShowRecentContextType = {
  shouldShowRecentPlay: boolean;
  setShouldShowRecentPlay: (newUseShouldShowRecent: boolean) => void;
  shouldShowRecentCast: boolean;
  setShouldShowRecentCast: (newUseShouldShowRecent: boolean) => void;
};

const ShouldShowRecentContext = createContext<ShouldShowRecentContextType>({
  shouldShowRecentPlay: true,
  setShouldShowRecentPlay: () => {},
  shouldShowRecentCast: true,
  setShouldShowRecentCast: () => {},
});

export function ShouldShowRecentContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [shouldShowRecentPlay, setShouldShowRecentPlay] = useLocalBool({
    key: "show-recent-play",
    defaultValue: true,
  });
  const [shouldShowRecentCast, setShouldShowRecentCast] = useLocalBool({
    key: "show-recent-cast",
    defaultValue: true,
  });
  const value: ShouldShowRecentContextType = useMemo(
    () => ({
      shouldShowRecentPlay,
      setShouldShowRecentPlay,
      shouldShowRecentCast,
      setShouldShowRecentCast,
    }),
    [
      shouldShowRecentPlay,
      setShouldShowRecentPlay,
      shouldShowRecentCast,
      setShouldShowRecentCast,
    ],
  );
  return (
    <ShouldShowRecentContext.Provider value={value}>
      {children}
    </ShouldShowRecentContext.Provider>
  );
}

export function useShouldShowRecentContext() {
  const context = useContext(ShouldShowRecentContext);
  return context;
}
