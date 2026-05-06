import { useCallback, useEffect, useRef, useState } from "react";

interface LocalStringInput {
  key: string;
  defaultValue: string;
}

export default function useLocalString({
  key,
  defaultValue,
}: LocalStringInput): [string, (newValue: string) => void] {
  const [value, setValueRaw] = useState<string>(() => {
    if (global.window == undefined || localStorage == null) {
      return defaultValue;
    }
    const fromStorage = localStorage.getItem(key);
    if (fromStorage == null || fromStorage === "") {
      return defaultValue;
    }
    return fromStorage;
  });

  useEffect(() => {
    if (global.window == undefined || localStorage == null) {
      setValueRaw(defaultValue);
      return;
    }
    const fromStorage = localStorage.getItem(key);
    if (fromStorage == null || fromStorage === "") {
      setValueRaw(defaultValue);
      return;
    }
    setValueRaw(fromStorage);
    return;
  }, [key]);

  const setValue = useCallback(
    (newValue: string) => {
      setValueRaw(newValue);
      if (global.window == undefined || localStorage == null) {
        return;
      }
      localStorage.setItem(key, newValue);
    },
    [key]
  );

  return [value, setValue];
}
