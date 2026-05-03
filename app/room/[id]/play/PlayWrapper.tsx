"use client";

import dynamic from "next/dynamic";
import { Props } from "./Play";

const PlayWithOffsetProvider = dynamic(
  () => import("./PlayWithOffsetProvider"),
  { ssr: false },
);

export default function CastWrapper(props: Props) {
  return <PlayWithOffsetProvider {...props} />;
}
