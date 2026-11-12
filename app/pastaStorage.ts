import { files } from "./files";
import { xxh64 } from "@node-rs/xxhash";
import { UFOPasta } from "./generator/ufoGenerator";
import { brotliCompress, brotliDecompress } from "node:zlib";
import { promisify } from "node:util";
import { STANDARD_UFO } from "./pastas/standardUfo";
import { SPICY_UFO } from "./pastas/spicyUfo";
import { NES_50_UFO } from "./pastas/nes50Ufo";
import { EVERY_GAME_UFO } from "./pastas/everyGameUfo";
import validateStr from "./generator/validateStr";

const compress = promisify(brotliCompress);
const decompress = promisify(brotliDecompress);

const HASHES: Array<[UFOPasta, null | bigint]> = [
  [STANDARD_UFO, null],
  [SPICY_UFO, null],
  [NES_50_UFO, null],
  [EVERY_GAME_UFO, null],
];

function getFilename(hash: bigint): string {
  return hash.toString() + ".json.br";
}

async function isStored(hash: bigint): Promise<boolean> {
  return await files.exists(getFilename(hash));
}

export async function storePasta(pasta: UFOPasta): Promise<void> {
  try {
    const json = JSON.stringify(pasta);
    const hash = xxh64(json);
    const alreadyExists = await isStored(hash);
    if (alreadyExists) {
      return;
    }
    const compressed = await compress(json);
    await files.upload(getFilename(hash), compressed);
  } catch {}
}

export async function fetchPasta(hash: bigint): Promise<null | UFOPasta> {
  for (const pair of HASHES) {
    if (pair[1] == null) {
      pair[1] = xxh64(JSON.stringify(pair[0]));
    }
    if (pair[1] === hash) {
      console.log("found standard pasta");
      return pair[0];
    }
  }
  try {
    const storedFile = await files.download(getFilename(hash));
    const buffer = await storedFile.arrayBuffer();
    const decompressed = await decompress(buffer);
    const pastaStr = decompressed.toString();
    const result = validateStr(pastaStr);
    return result.pasta;
  } catch {
    return null;
  }
}
