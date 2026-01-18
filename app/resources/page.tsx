import { Metadata } from "next";
import Resources from "./Resources";

export const metadata: Metadata = {
  title: "UFO 50 Bingo Resources",
  description: "View community resources for UFO 50 Bingo",
};

export default function ResourcesPage() {
  return <Resources />
}