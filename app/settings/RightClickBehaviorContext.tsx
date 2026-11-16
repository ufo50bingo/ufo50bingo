"use client";

import { createContext, useContext, useMemo } from "react";
import useRightClickBehavior, {
  RightClickBehavior,
} from "./useRightClickBehavior";
import useCustomColor from "./useCustomColor";
import { getColorHex } from "../color";

type RightClickBehaviorContextType = {
  rightClickBehavior: ReadonlyArray<RightClickBehavior>;
  setRightClickBehavior: (
    newRightClickBehavior: ReadonlyArray<RightClickBehavior>,
  ) => void;
  customColor: string;
  setCustomColor: (newCustomColor: string) => void;
};

export const RightClickBehaviorContext =
  createContext<RightClickBehaviorContextType>({
    rightClickBehavior: [{ type: "star" }],
    setRightClickBehavior: () => {},
    customColor: getColorHex("red"),
    setCustomColor: () => {},
  });

export function RightClickBehaviorContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [rightClickBehavior, setRightClickBehavior] = useRightClickBehavior();
  const [customColor, setCustomColor] = useCustomColor();
  const value: RightClickBehaviorContextType = useMemo(
    () => ({
      rightClickBehavior,
      setRightClickBehavior,
      customColor,
      setCustomColor,
    }),
    [customColor, rightClickBehavior, setCustomColor, setRightClickBehavior],
  );
  return (
    <RightClickBehaviorContext.Provider value={value}>
      {children}
    </RightClickBehaviorContext.Provider>
  );
}

export function useRightClickBehaviorContext() {
  const context = useContext(RightClickBehaviorContext);
  return context;
}
