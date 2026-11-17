import { headers } from "next/headers";
import { auth } from "./auth";

// Reads the session from the database rather than the cookie cache, so
// granting or revoking admin takes effect immediately. Use this for every
// server-side admin check.
export default async function getIsAdmin(): Promise<boolean> {
  const session = await auth.api.getSession({
    headers: await headers(),
    query: { disableCookieCache: true },
  });
  return session?.user.isAdmin === true;
}
