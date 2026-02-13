// TODO: Use STANDARD_UFO again!
import { SEASON_2_UFO } from "./season2Ufo";

const _GENERALS = Object.values(SEASON_2_UFO.goals.general).flat();
export type StandardGeneral = (typeof _GENERALS)[number];
