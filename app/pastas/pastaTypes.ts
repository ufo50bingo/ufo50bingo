import { STANDARD_UFO } from "./standardUfo";

const GENERALS = Object.values(STANDARD_UFO.goals.general).flat();
const _GENERAL_STRINGS = GENERALS.map((g) =>
  typeof g === "string" ? g : g.name,
);
const _GENERAL_FALLBACKS = GENERALS.filter((g) => typeof g !== "string").map((g) => g.restriction.fallback);
export type StandardGeneral = (typeof _GENERAL_STRINGS)[number] | (typeof _GENERAL_FALLBACKS)[number];
