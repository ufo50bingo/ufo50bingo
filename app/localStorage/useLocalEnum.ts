import useLocalString from "./useLocalString";

interface LocalEnumInput<T extends string> {
  key: string;
  defaultValue: T;
  options: ReadonlyArray<T>;
}

export default function useLocalEnum<T extends string>({ key, defaultValue, options }: LocalEnumInput<T>): [T, (newValue: T) => void] {
  const [rawValue, setValue] = useLocalString({ key, defaultValue });
  const value = options.find(value => value === rawValue) ?? defaultValue;
  return [value, setValue];
}