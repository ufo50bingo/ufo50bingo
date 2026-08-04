import { getRoomSettingsUrl } from "@/app/roomApi";

export default async function getSeed(id: string): Promise<number> {
  const settingsUrl = getRoomSettingsUrl(id, "bingosync");
  const settingsResponse = await fetch(settingsUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const json = await settingsResponse.json();
  const seed: null | void | number = json?.settings?.seed;
  if (seed == null) {
    throw new Error(`Failed to find seed.`);
  }
  return seed;
}
