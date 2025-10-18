"use client";

import dynamic from "next/dynamic";
import { Props } from "./Play";

const Play = dynamic(() => import("./Play"), { ssr: false });

export default function CastWrapper(props: Props) {
  return <Play {...props} />;
}
