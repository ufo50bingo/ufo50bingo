"use server";

import { createUserID, readSession, writeSession } from "./sessionUtil";

export default async function enableAdmin(password: string): Promise<void> {
  if (
    process.env.ADMIN_PASSWORD == null ||
    password !== process.env.ADMIN_PASSWORD
  ) {
    throw new Error("Invalid admin password");
  }
  const session = (await readSession()) ?? { id: createUserID(), admin: true };
  session.admin = true;
  await writeSession(session);
}
