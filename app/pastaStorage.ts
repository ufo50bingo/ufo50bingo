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

export async function fetchPastas(
  hashes: bigint[],
): Promise<Map<bigint, UFOPasta | null>> {
  const pastas = new Map<bigint, UFOPasta | null>(
    hashes.map((hash) => [hash, null]),
  );
  if (hashes.length === 0) {
    return pastas;
  }

  const filenameToHash = new Map<string, bigint>(
    hashes.map((hash) => [getFilename(hash), hash]),
  );

  let storedFiles;
  try {
    ({ results: storedFiles } = await files.download([
      ...filenameToHash.keys(),
    ]));
  } catch {
    return pastas; // whole download failed
  }

  await Promise.all(
    storedFiles.map(async (storedFile) => {
      const hash = filenameToHash.get(storedFile.key);
      if (hash == null) {
        return;
      }
      try {
        const buffer = await storedFile.arrayBuffer();
        const decompressed = await decompress(buffer);
        const result = validateStr(decompressed.toString());
        pastas.set(hash, result.pasta);
      } catch {
        // failed to decrypt, so just keep it null
      }
    }),
  );

  return pastas;
}
