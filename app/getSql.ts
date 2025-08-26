import { neon, NeonQueryFunction } from "@neondatabase/serverless";

export default function getSQl(): NeonQueryFunction<false, false> {
  return neon(process.env.DATABASE_URL);
}
