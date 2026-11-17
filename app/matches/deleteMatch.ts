"use server";

import { revalidatePath } from "next/cache";

export default async function deleteMatch(id: string): Promise<void> {
  // TODO: Support deleting matches again
  revalidatePath("/matches");
  // await removeFromGsheet(id, sqlResult[0].league_season);
}
