"use server";

import { auth } from "@/app/auth";
import getSession from "@/app/getSession";
import { refresh } from "next/cache";
import { cookies, headers } from "next/headers";

export async function confirmAnonymous(
  gameId: number,
  createWithName: null | string,
) {
  let session = await getSession();
  if (createWithName != null) {
    if (createWithName.length === 0) {
      throw new Error("You must specify a non-empty name");
    }
    session = await getSession();
    if (session == null) {
      const result = await auth.api.signInAnonymous({
        headers: await headers(),
      });
      const ctx = await auth.$context;
      await ctx.internalAdapter.updateUser(result.user.id, {
        name: createWithName,
      });
    }
  }

  // setting cookie at the end so it causes refresh
  const cookieStore = await cookies();
  cookieStore.set(`anonymous-confirmed-${gameId}`, "true", {
    maxAge: 24 * 60 * 60,
    sameSite: "lax",
    path: `/room/${gameId}`,
  });
}
