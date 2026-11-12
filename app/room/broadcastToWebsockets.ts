export default async function broadcastToWebsockets(
  roomId: string,
  message: string,
): Promise<void> {
  await fetch(
    `https://ufo50bingo-websocket.frankthompson-cd2.workers.dev/broadcast/room/${roomId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Authorization: `Bearer ${process.env.CLOUDFLARE_INTERNAL_SECRET}`,
      },
      body: JSON.stringify({ message }),
    },
  );
}
