import { Metadata } from "next";
import AllGoals from "./AllGoals";

export const metadata: Metadata = {
  title: "All UFO 50 Bingo Goals",
  description: "See the full list of UFO 50 Bingo goals, and your stats for each!",
};

export default function GoalsPage() {
  return <AllGoals />;
}