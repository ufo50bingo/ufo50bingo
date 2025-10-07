"use client";

import dynamic from "next/dynamic";
import { CastProps } from "./Cast";

const Cast = dynamic(() => import("./Cast"), { ssr: false });

export default function CastWrapper(props: CastProps) {
  return <Cast {...props} />;
}
