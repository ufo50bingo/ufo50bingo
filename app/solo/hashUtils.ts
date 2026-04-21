// stolen from https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest
async function getHash(message: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(message); // encode as (utf-8) Uint8Array
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", msgUint8); // hash the message
  // @ts-expect-error toHex may or may not exist. We check that it exists before using it
  if (Uint8Array.prototype.toHex) {
    // @ts-expect-error Use toHex if supported.
    return new Uint8Array(hashBuffer).toHex(); // Convert ArrayBuffer to hex string.
  }
  // If toHex() is not supported, fall back to an alternative implementation.
  const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join(""); // convert bytes to hex string
  return hashHex;
}

export async function hashGoalList(
  goalList: ReadonlyArray<string>,
): Promise<string> {
  return await getHash(goalList.join("\n"));
}
