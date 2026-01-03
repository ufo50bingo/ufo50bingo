import { STANDARD_UFO } from "./standardUfo";

const _GENERALS = Object.values(STANDARD_UFO.goals.general).flat();
export type StandardGeneral = (typeof _GENERALS)[number];
