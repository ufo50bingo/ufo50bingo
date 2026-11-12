import { headers } from "next/headers";
import { auth } from "./auth";

export default async function getUserId(): Promise<number> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (session == null) {
    throw new Error("Not authenticated");
  }
  return Number(session.user.id);
}
