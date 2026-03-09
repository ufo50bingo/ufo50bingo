"use client";

import { createContext, useContext, useMemo } from "react";
import useRightClickBehavior, {
  RightClickBehavior,
} from "./useRightClickBehavior";
import useCustomColor from "./useCustomColor";

type RightClickBehaviorContextType = {
  rightClickBehavior: RightClickBehavior;
  setRightClickBehavior: (newRightClickBehavior: RightClickBehavior) => void;
  customColor: string;
  setCustomColor: (newCustomColor: string) => void;
};

const RightClickBehaviorContext = createContext<RightClickBehaviorContextType>({
  rightClickBehavior: "star",
  setRightClickBehavior: () => {},
  customColor: "#ee5f5b",
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
