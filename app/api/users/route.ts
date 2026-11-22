import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import getSql from "@/app/getSql";
import { BingosyncColor } from "@/app/matches/parseBingosyncData";

export const USER_CACHE_TAG = "user-cache";

export type BasicUser = {
  userId: number;
  name: string;
  username: null | string;
  image: null | string;
  color: null | BingosyncColor;
};

export async function GET() {
  const users = await getUsers();
  return NextResponse.json(users, {
    headers: {
      "Cache-Control": "public, max-age=300",
    },
  });
}

const getUsers = unstable_cache(
  async (): Promise<Array<BasicUser>> => {
    const sql = getSql(true);
    const result = await sql`
    SELECT
      id,
      name,
      username,
      image,
      color
    FROM "user"
    WHERE isAnonymous = FALSE
  `;
    const users = result.map((raw) => ({
      userId: raw.id,
      name: raw.name,
      username: raw.username ?? null,
      image: raw.image ?? null,
      color: raw.color ?? null,
    }));
    return users;
  },
  [USER_CACHE_TAG],
  { revalidate: 60 * 60 * 12, tags: [USER_CACHE_TAG] },
);
