import { useCallback } from "react";
import useLocalEnum from "./useLocalEnum";

interface LocalBoolInput {
  key: string;
  defaultValue: boolean;
}

export default function useLocalBool({
  key,
  defaultValue,
}: LocalBoolInput): [boolean, (newValue: boolean) => void] {
  const [rawValue, setValueRaw] = useLocalEnum({
    key,
    defaultValue: defaultValue ? "true" : "false",
    options: ["true", "false"],
  });
  const setValue = useCallback(
    (newValue: boolean) => setValueRaw(newValue ? "true" : "false"),
    [setValueRaw]
  );
  return [rawValue === "true" ? true : false, setValue];
}
