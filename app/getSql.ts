import { neon, NeonQueryFunction } from "@neondatabase/serverless";

export default function getSQl(): NeonQueryFunction<false, false> {
  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl == null) {
    throw new Error("Could not find DB URL");
  }
  return neon(dbUrl);
}
