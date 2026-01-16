import { Session } from "./sessionUtil";

export function parseSession(data: string): Session | null {
  try {
    const session = JSON.parse(data);
    if (typeof session.id !== "string" || typeof session.admin !== "boolean") {
      return null;
    }
    return session;
  } catch {
    return null;
  }
}
