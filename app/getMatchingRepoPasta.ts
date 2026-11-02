import { UFOPasta } from "./generator/ufoGenerator";
import {
  EVERY_GAME_UFO_HASH,
  NES_50_UFO_HASH,
  SPICY_UFO_HASH,
  STANDARD_UFO_HASH,
} from "./pastaHashes.generated";
import { EVERY_GAME_UFO } from "./pastas/everyGameUfo";
import { NES_50_UFO } from "./pastas/nes50Ufo";
import { SPICY_UFO } from "./pastas/spicyUfo";
import { STANDARD_UFO } from "./pastas/standardUfo";

const HASHES: Array<[UFOPasta, bigint]> = [
  [STANDARD_UFO, STANDARD_UFO_HASH],
  [SPICY_UFO, SPICY_UFO_HASH],
  [NES_50_UFO, NES_50_UFO_HASH],
  [EVERY_GAME_UFO, EVERY_GAME_UFO_HASH],
];

export function getMatchingRepoPasta(hash: bigint): null | UFOPasta {
  for (const pair of HASHES) {
    if (pair[1] === hash) {
      return pair[0];
    }
  }
  return null;
}
