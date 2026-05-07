import brotliPromise from "brotli-wasm"; // Import the default export

function base64ToBytes(base64: string): Uint8Array<ArrayBuffer> {
  const binString = atob(base64);
  return Uint8Array.from(binString, (v, _) => v.codePointAt(0)!);
}

function bytesToBase64(bytes: Uint8Array<ArrayBuffer>) {
  const binString = Array.from(bytes, (byte) =>
    String.fromCodePoint(byte),
  ).join("");
  return btoa(binString);
}

function base64UrlEncode(str: string): string {
  return bytesToBase64(new TextEncoder().encode(str))
    .replace(/\//g, "_")
    .replace(/\+/g, "-");
}

async function compress(str: string): Promise<string> {
  const brotli = await brotliPromise;
  return brotli.compress(new TextEncoder().encode(str));
}

function base64UrlDecode(str: string): string {
  return new TextDecoder().decode(
    base64ToBytes(str.replace(/_/g, "/").replace(/-/g, "+")),
  );
}

export function encodeGoalList(goalList: ReadonlyArray<string>): string {
  return base64UrlEncode(goalList.join("\n"));
}

export function decodeGoalList(encoded: string): ReadonlyArray<string> {
  return base64UrlDecode(encoded).split("\n");
}
