import getBroadcastToken from "./[id]/common/getBroadcastToken";

// only needed for server broadcasts
export default async function broadcastToWebsockets(
  gameId: number,
  message: string,
): Promise<void> {
  const token = await getBroadcastToken(gameId);
  await fetch(
    `https://ufo50bingo-websocket.frankthompson-cd2.workers.dev/broadcast/room/${gameId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token, message }),
    },
  );
}
