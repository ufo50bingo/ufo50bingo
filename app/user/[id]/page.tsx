import { cache } from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import getSql from "@/app/getSql";
import UserProfile, { ProfileUser } from "./UserProfile";

// cached so generateMetadata and the page share one query per request
const fetchUser = cache(async (idStr: string): Promise<null | ProfileUser> => {
  const id = Number(idStr);
  if (!Number.isInteger(id)) {
    return null;
  }
  const sql = getSql();
  const result = await sql`
    SELECT name, username, image
    FROM "user"
    WHERE id = ${id}
  `;
  const row = result[0];
  if (row == null) {
    return null;
  }
  return {
    name: row.name,
    username: row.username ?? null,
    image: row.image ?? null,
  };
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const user = await fetchUser(id);
  return { title: user?.name ?? "User not found" };
}

export default async function UserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await fetchUser(id);
  if (user == null) {
    notFound();
  }
  return <UserProfile user={user} />;
}
