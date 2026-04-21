import brotliPromise from "brotli-wasm"; // Import the default export

function base64ToBytes(base64: string): Uint8Array {
  const binString = atob(base64);
  return Uint8Array.from(binString, (v, _) => v.codePointAt(0)!);
}

function bytesToBase64(bytes: Uint8Array) {
  const binString = Array.from(bytes, (byte) =>
    String.fromCodePoint(byte),
  ).join("");
  return btoa(binString);
}

function toUrlSafe(base64: string): string {
  return base64.replace(/\//g, "_").replace(/\+/g, "-");
}

function fromUrlSafe(urlSafe: string): string {
  return urlSafe.replace(/_/g, "/").replace(/-/g, "+");
}

async function compress(str: string): Promise<Uint8Array> {
  const brotli = await brotliPromise;
  return brotli.compress(new TextEncoder().encode(str));
}

async function decompress(encoded: Uint8Array): Promise<string> {
  const brotli = await brotliPromise;
  return new TextDecoder().decode(brotli.decompress(encoded));
}

export async function encodeGoalList(
  goalList: ReadonlyArray<string>,
): Promise<string> {
  const compressed = await compress(goalList.join("\n"));
  return toUrlSafe(bytesToBase64(compressed));
}

export async function decodeGoalList(
  encoded: string,
): Promise<ReadonlyArray<string>> {
  const compressed = base64ToBytes(fromUrlSafe(encoded));
  const joinedList = await decompress(compressed);
  return joinedList.split("\n");
}
