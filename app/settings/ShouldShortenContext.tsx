"use client";

import { createContext, useContext, useMemo } from "react";
import useLocalBool from "../localStorage/useLocalBool";

type ShouldShortenContextType = {
  shouldShortenPlay: boolean;
  setShouldShortenPlay: (newUseShouldShorten: boolean) => void;
  shouldShortenCast: boolean;
  setShouldShortenCast: (newUseShouldShorten: boolean) => void;
};

const ShouldShortenContext = createContext<ShouldShortenContextType>({
  shouldShortenPlay: false,
  setShouldShortenPlay: () => { },
  shouldShortenCast: false,
  setShouldShortenCast: () => { },
});

export function ShouldShortenContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [shouldShortenPlay, setShouldShortenPlay] = useLocalBool({ key: "short-play", defaultValue: false });
  const [shouldShortenCast, setShouldShortenCast] = useLocalBool({ key: "short-cast", defaultValue: false });
  const value: ShouldShortenContextType = useMemo(
    () => ({
      shouldShortenPlay,
      setShouldShortenPlay,
      shouldShortenCast,
      setShouldShortenCast,
    }),
    [shouldShortenPlay, setShouldShortenPlay, shouldShortenCast, setShouldShortenCast],
  );
  return (
    <ShouldShortenContext.Provider value={value}>
      {children}
    </ShouldShortenContext.Provider>
  );
}

export function useShouldShortenContext() {
  const context = useContext(ShouldShortenContext);
  return context;
}
