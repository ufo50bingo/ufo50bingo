import getUserIdNullable from "./getUserIdNullable";

export default async function getUserId(): Promise<number> {
  const userId = await getUserIdNullable();
  if (userId == null) {
    throw new Error("You must be logged in!");
  }
  return userId;
}
