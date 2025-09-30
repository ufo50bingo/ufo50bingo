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
          // socket keys expire after 5 minutes
          // need to keep the session cookie and generate a new socket key from it
          const newSocketKey = await getSocketKey(roomId);
          setSocketKey(newSocketKey);
        }}
      >
        Get New Socket Key
      </Button>
      <Button
        onClick={async () => {
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
        Connect
      </Button>
    </Stack>
  );
}
