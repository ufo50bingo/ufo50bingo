import { Metadata } from "next";
import SoloWrapper from "./SoloWrapper";

export const metadata: Metadata = {
    title: "UFO 50 Bingo Solo Board",
    description: "Practice completing a solo board",
};

export default function SoloPage() {
    return <SoloWrapper />;
}
