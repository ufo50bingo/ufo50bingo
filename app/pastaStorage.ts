import { files } from "./files";
import { UFOPasta } from "./generator/ufoGenerator";
import { brotliCompress, brotliDecompress } from "node:zlib";
import { promisify } from "node:util";
import validateStr from "./generator/validateStr";

const compress = promisify(brotliCompress);
const decompress = promisify(brotliDecompress);

function getFilename(hash: bigint): string {
  return "pasta" + hash.toString() + ".json.br";
}

async function isStored(hash: bigint): Promise<boolean> {
  return await files.exists(getFilename(hash));
}

export async function storePasta(json: string, hash: bigint): Promise<void> {
  try {
    const alreadyExists = await isStored(hash);
    if (alreadyExists) {
      return;
    }
    const compressed = await compress(json);
    await files.upload(getFilename(hash), compressed);
  } catch {}
}

export async function fetchPasta(hash: bigint): Promise<null | UFOPasta> {
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
