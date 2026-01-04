import { useCallback } from "react";
import useLocalString from "./useLocalString";

interface LocalNumberInput {
  key: string;
  defaultValue: number;
}

export default function useLocalNumber({ key, defaultValue }: LocalNumberInput): [number, (newValue: number) => void] {
  const [rawValue, setValueRaw] = useLocalString({ key, defaultValue: defaultValue.toString() });
  const setValue = useCallback((newValue: number) => setValueRaw(newValue.toString()), [setValueRaw])
  return [Number(rawValue), setValue];
}