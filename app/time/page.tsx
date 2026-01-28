import { Metadata } from "next";
import TimestampCopierWrapper from "./TimestampCopierWrapper";

export const metadata: Metadata = {
  title: "UFO 50 Bingo Timestamps",
  description: "Create timestamps to paste into Discord",
};

export default function TimePage() {
  return <TimestampCopierWrapper />;
}
