"use client";

import { ServerOffsetContextProvider } from "../ServerOffsetContext";
import Play, { Props } from "./Play";

export default function PlayWithOffsetProvider(props: Props) {
  return (
    <ServerOffsetContextProvider>
      <Play {...props} />
    </ServerOffsetContextProvider>
  );
}
