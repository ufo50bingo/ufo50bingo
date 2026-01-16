import { cookies } from "next/headers";
import crypto from "crypto";

export interface Session {
  id: string;
  admin: boolean;
}

const MAX_AGE = 34560000; // 400 days, the max that browsers accept

function sign(payload: string): string {
  return crypto
    .createHmac("sha256", process.env.SESSION_SECRET ?? "")
    .update(payload)
    .digest("hex");
}

export async function readSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const data = cookieStore.get("session_data")?.value;
  const sig = cookieStore.get("session_sig")?.value;

  if (data == null || sig == null) {
    return null;
  }
  if (sign(data) !== sig) {
    return null;
  }

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

export async function writeSession(data: Session): Promise<void> {
  const payload = JSON.stringify(data);
  const signature = sign(payload);

  const cookieStore = await cookies();

  cookieStore.set("session_data", payload, {
    httpOnly: false,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: MAX_AGE,
  });

  cookieStore.set("session_sig", signature, {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: MAX_AGE,
  });
}
