"use client";

import dynamic from "next/dynamic";

const Solo = dynamic(() => import("./Solo"), {
    ssr: false,
});

export default function SoloWrapper() {
    return <Solo />;
}
