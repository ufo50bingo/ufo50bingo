"use client";

import { ServerOffsetContextProvider } from "../ServerOffsetContext";
import Cast, { CastProps } from "./Cast";

export default function CastWithOffsetProvider(props: CastProps) {
  return (
    <ServerOffsetContextProvider>
      <Cast {...props} />
    </ServerOffsetContextProvider>
  );
}
