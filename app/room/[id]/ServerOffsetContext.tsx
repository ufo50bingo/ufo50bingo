"use client";

import useLocalNumber from "@/app/localStorage/useLocalNumber";
import React, { createContext, useContext, useEffect, useMemo } from "react";
import getServerOffset from "./getServerOffset";

export enum NextGoalChoice {
  RANDOM = "RANDOM",
  PREFER_FEWER_ATTEMPTS = "PREFER_FEWER_ATTEMPTS",
}

type ServerOffsetContextType = {
  getClientMsFromServerMs: (serverMs: number) => number;
  getServerMsFromClientMs: (serverMs: number) => number;
};

const ServerOffsetContext = createContext<ServerOffsetContextType>({
  getClientMsFromServerMs: (x) => x,
  getServerMsFromClientMs: (x) => x,
});

export function ServerOffsetContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [offsetMs, setOffsetMs] = useLocalNumber({
    key: "offsetMs",
    defaultValue: 0,
  });

  useEffect(() => {
    async function computeOffset() {
      const offset = await getServerOffset(3);
      setOffsetMs(offset);
    }
    computeOffset();
  }, [setOffsetMs]);

  const value = useMemo(
    () => ({
      getClientMsFromServerMs: (serverMs: number) => serverMs + offsetMs,
      getServerMsFromClientMs: (clientMs: number) => clientMs - offsetMs,
    }),
    [offsetMs],
  );
  return (
    <ServerOffsetContext.Provider value={value}>
      {children}
    </ServerOffsetContext.Provider>
  );
}

export function useServerOffsetContext() {
  return useContext(ServerOffsetContext);
}
