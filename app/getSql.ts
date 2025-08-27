import { neon, NeonQueryFunction } from "@neondatabase/serverless";

export default function getSQl(
  forceCache: boolean = true
): NeonQueryFunction<false, false> {
  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl == null) {
    throw new Error("Could not find DB URL");
  }
  return forceCache
    ? neon(dbUrl, { fetchOptions: { cache: "force-cache" } })
    : neon(dbUrl);
}
