"use client";

import dynamic from "next/dynamic";

const LayoutEditor = dynamic(() => import("./LayoutEditor"), {
  ssr: false,
});

export default LayoutEditor;
