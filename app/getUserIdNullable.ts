import getSession from "./getSession";

export default async function getUserIdNullable(): Promise<number | null> {
  const session = await getSession();
  if (session == null) {
    return null;
  }
  return Number(session.user.id);
}
