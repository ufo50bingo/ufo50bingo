import { STANDARD_UFO } from "./standardUfo";

const GENERALS = Object.values(STANDARD_UFO.goals.general).flat();
const _GENERAL_STRINGS = GENERALS.map((g) =>
  typeof g === "string" ? g : g.name,
);
export type StandardGeneral = (typeof _GENERAL_STRINGS)[number];
