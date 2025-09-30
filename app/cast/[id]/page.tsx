"use client";

import { Button, Stack, TextInput } from "@mantine/core";
import { useState } from "react";
import getSocketKey from "./getSocketKey";

export default function CastPage() {
  const [roomId, setRoomId] = useState("");
  const [socketKey, setSocketKey] = useState("");
  const [_socket, setSocket] = useState<null | WebSocket>(null);
  return (
    <Stack>
      <TextInput
        label="Room ID"
        value={roomId}
        onChange={(event) => setRoomId(event.target.value)}
      />
      <TextInput
        label="Socket Key"
        value={socketKey}
        onChange={(event) => setSocketKey(event.target.value)}
      />
      <Button
        onClick={async () => {
          const socketKey = await getSocketKey(roomId);
          const url = "wss://sockets.bingosync.com/broadcast";
          const newSocket = new WebSocket(url);
          newSocket.onopen = () =>
            newSocket.send(JSON.stringify({ socket_key: socketKey }));
          newSocket.onmessage = (evt) => {
            console.log("on message...");
            const json = JSON.parse(evt.data);
            console.log(json);
          };
          setSocket(newSocket);
        }}
      >
        Connect to Websocket
      </Button>
    </Stack>
  );
}
