"use client";

import dynamic from "next/dynamic";
import { PlayProps } from "./Play";

const Play = dynamic(() => import("./Play"), { ssr: false });

export default function CastWrapper(props: PlayProps) {
    return <Play {...props} />;
}
