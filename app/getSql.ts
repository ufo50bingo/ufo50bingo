import { neon, NeonQueryFunction } from "@neondatabase/serverless";

export default function getSql(
  forceCache: boolean = true,
  tags: ReadonlyArray<string> = []
): NeonQueryFunction<false, false> {
  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl == null) {
    throw new Error("Could not find DB URL");
  }
  if (forceCache && tags.length > 0) {
    return neon(dbUrl, { fetchOptions: { cache: "force-cache", next: { tags } } });
  } else if (forceCache) {
    return neon(dbUrl, { fetchOptions: { cache: "force-cache" } });
  } else if (tags.length > 0) {
    return neon(dbUrl, { fetchOptions: { next: { tags } } });
  }
  return neon(dbUrl);
}
