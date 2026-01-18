import { Metadata } from "next";
import Practice from "./Practice";

export const metadata: Metadata = {
  title: "UFO 50 Bingo Practice",
  description: "Practice UFO 50 Bingo goals and track your stats!",
};

export default function PracticePage() {
  return <Practice />;
}