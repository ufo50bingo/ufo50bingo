import { Metadata } from "next";
import LayoutEditorClient from "./LayoutEditorClient";

export const metadata: Metadata = {
  title: "UFO 50 Bingo Layout Editor",
  description: "Edit your casting layout",
};

export default function LayoutPage() {
  return <LayoutEditorClient canvasHeight={1080} canvasWidth={1920} />;
}
