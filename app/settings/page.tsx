import { Metadata } from "next";
import Settings from "./Settings";

export const metadata: Metadata = {
  title: "UFO 50 Bingo Settings",
  description: "Manage your UFO 50 Bingo Settings",
};

export default function SettingsPage() {
  return <Settings />;
}