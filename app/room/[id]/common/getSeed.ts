export default async function getSeed(id: string): Promise<number> {
  const settingsUrl = `https://celestebingo.rhelmot.io/room/${id}/room-settings`;
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
