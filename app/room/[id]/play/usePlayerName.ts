import { useMemo } from "react";

export default function usePlayerName(): string {
  return useMemo(() => {
    const name = document.cookie
      .split("; ")
      .find((row) => row.startsWith("playername="))
      ?.split("=")?.[1];
    return name ?? "";
  }, []);
}
