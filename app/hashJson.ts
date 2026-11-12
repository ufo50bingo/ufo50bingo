import { xxh64 } from "@node-rs/xxhash";

export function hashJson(json: string): bigint {
  return BigInt.asIntN(64, xxh64(json));
}
