import { useCallback, useMemo } from "react";

type Return = [string, (newDefaultName: string) => unknown];

export default function useDefaultName(): Return {
  const defaultName = useMemo(() => {
    if (global.window == undefined || localStorage == null) {
      return "";
    }
    return localStorage.getItem("default_name") ?? "";
  }, []);

  const setDefaultName = useCallback((newDefaultName: string) => {
    if (global.window == undefined || localStorage == null) {
      return;
    }
    localStorage.setItem("default_name", newDefaultName);
  }, []);

  return [defaultName, setDefaultName];
}
