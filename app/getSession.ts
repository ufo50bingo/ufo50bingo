import { headers } from "next/headers";
import { auth } from "./auth";

export type PageSession = NonNullable<
  Awaited<ReturnType<typeof auth.api.getSession>>
>;

export default async function getSession(): Promise<null | PageSession> {
  return await auth.api.getSession({
    headers: await headers(),
  });
}
