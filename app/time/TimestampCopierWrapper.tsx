"use client";

import dynamic from "next/dynamic";

const TimestampCopier = dynamic(() => import("./TimestampCopier"), {
  ssr: false,
});

export default function TimestampCopierWrapper() {
  return <TimestampCopier />;
}
