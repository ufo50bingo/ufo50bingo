import { getRoomSettingsUrl, RoomBackend } from "@/app/roomApi";

export default async function getSeed(id: string, roomBackend: RoomBackend): Promise<number> {
  const settingsUrl = getRoomSettingsUrl(id, roomBackend);
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
