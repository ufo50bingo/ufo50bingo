"use client";

import dynamic from "next/dynamic";
import { CastProps } from "./Cast";

const CastWithOffsetProvider = dynamic(
  () => import("./CastWithOffsetProvider"),
  { ssr: false },
);

export default function CastWrapper(props: CastProps) {
  return <CastWithOffsetProvider {...props} />;
}
