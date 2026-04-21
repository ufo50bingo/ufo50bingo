import xxhash from "xxhash-wasm";

export default async function hashGoalList(
  goalList: ReadonlyArray<string>,
): Promise<bigint> {
  const hasher = await xxhash();
  return hasher.h64(goalList.join("\n"));
}
