import { Metadata } from "next";
import LayoutEditor from "./LayoutEditor";

export const metadata: Metadata = {
  title: "UFO 50 Bingo Layout Editor",
  description: "Edit your casting layout",
};

export default function LayoutPage() {
  return <LayoutEditor canvasHeight={1080} canvasWidth={1920} />;
}
