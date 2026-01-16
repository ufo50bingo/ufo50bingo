import { parseSession } from "./parseSession";
import { Session } from "./sessionUtil";

export default function readSessionClient(): Session | null {
  if (typeof document === "undefined") {
    return null;
  }

  const cookie = document.cookie
    .split("; ")
    .find((c) => c.startsWith("session_data="));

  if (cookie == null) {
    return null;
  }
  return parseSession(decodeURIComponent(cookie.split("=")[1]));
}
