import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import getSql from "@/app/getSql";

export const USER_CACHE_TAG = "user-cache";

export type BasicUser = {
  userId: number;
  name: string;
  username: null | string;
  image: null | string;
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
      image
    FROM "user";
  `;
    const users = result.map((raw) => ({
      userId: raw.id,
      name: raw.name,
      username: raw.username ?? null,
      image: raw.image ?? null,
    }));
    return users;
  },
  [USER_CACHE_TAG],
  { revalidate: 60 * 60 * 12, tags: [USER_CACHE_TAG] },
);
