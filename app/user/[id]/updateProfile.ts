"use server";

import { headers } from "next/headers";
import type { DiscordProfile } from "better-auth/social-providers";
import { auth } from "@/app/auth";
import { MAX_NAME_LENGTH } from "./maxNameLength";

async function getDiscordUserSession(requestHeaders: Headers) {
  const session = await auth.api.getSession({ headers: requestHeaders });
  if (session == null || session.user.isAnonymous === true) {
    throw new Error("Expected a signed in user");
  }
  return session;
}

export async function refreshFromDiscord(): Promise<void> {
  const requestHeaders = await headers();
  await getDiscordUserSession(requestHeaders);

  const accounts = await auth.api.listUserAccounts({ headers: requestHeaders });
  const discordAccount = accounts.find((a) => a.providerId === "discord");
  if (discordAccount == null) {
    throw new Error("Missing discord account");
  }
  const info = await auth.api.accountInfo({
    headers: requestHeaders,
    query: { accountId: discordAccount.id },
  });

  const profile = info.data as DiscordProfile;
  await auth.api.updateUser({
    headers: requestHeaders,
    body: {
      name: info.user.name,
      image: info.user.image,
      username: profile.username,
    },
  });
}

export async function updateName(name: string): Promise<void> {
  const requestHeaders = await headers();
  await getDiscordUserSession(requestHeaders);

  const trimmed = name.trim();
  if (trimmed === "" || trimmed.length > MAX_NAME_LENGTH) {
    throw new Error("Name can't be empty");
  }
  await auth.api.updateUser({
    headers: requestHeaders,
    body: { name: trimmed },
  });
}
