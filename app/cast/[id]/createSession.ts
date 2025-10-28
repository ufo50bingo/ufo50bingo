"use server";

import { redirect, RedirectType } from "next/navigation";
import { cookies } from "next/headers";

const SESSIONID_REGEX = /sessionid=([^;]+);/;

export default async function createSession(
  id: string,
  name: string,
  password: string,
  isCast: boolean
) {
  const joinResponse = await fetch(`https://www.bingosync.com/api/join-room`, {
    method: "POST",
    redirect: "manual",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: JSON.stringify({
      room: id,
      nickname: name + (isCast ? " (admin)" : ""),
      password,
      // typo in bingosync code
      is_specator: isCast,
    }).toString(),
  });

  const sessionCookie = joinResponse.headers.get("Set-Cookie");
  if (sessionCookie == null) {
    throw new Error(`Failed to fetch session cookie for id ${id}`);
  }

  const result = sessionCookie.match(SESSIONID_REGEX);
  if (result == null || result.length < 2) {
    throw new Error(`Failed to find CSRF token in bingosync response`);
  }
  const sessionId = result[1];

  const cookieStore = await cookies();

  const path = isCast ? `/cast/${id}` : `/play/${id}`;
  cookieStore.set("sessionid", sessionId, {
    expires: Date.now() + 2 * 7 * 24 * 60 * 60 * 1000,
    maxAge: 2 * 7 * 24 * 60 * 60,
    sameSite: "lax",
    path,
  });
  cookieStore.set("playername", name, {
    expires: Date.now() + 2 * 7 * 24 * 60 * 60 * 1000,
    maxAge: 2 * 7 * 24 * 60 * 60,
    sameSite: "lax",
    path,
  });
  redirect(path, RedirectType.replace);
}
