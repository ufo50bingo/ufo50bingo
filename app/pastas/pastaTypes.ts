import { STANDARD_UFO } from "./standardUfo";

const GENERALS = Object.values(STANDARD_UFO.goals.general).flat();
const _GENERAL_STRINGS = GENERALS.map((g) =>
  typeof g === "string" ? g : g.name,
);

type ExtractFallbacks<T> =
  T extends { fallback: infer F extends string }
  ? F
  : T extends readonly unknown[]
  ? ExtractFallbacks<T[number]>
  : T extends object
  ? ExtractFallbacks<T[keyof T]>
  : never;

type GeneralFallbacks = ExtractFallbacks<typeof STANDARD_UFO.goals.general>;

export type StandardGeneral = (typeof _GENERAL_STRINGS)[number] | GeneralFallbacks;
