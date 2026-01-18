import { Metadata } from "next";
import Playlist from "./Playlist";

export const metadata: Metadata = {
  title: "UFO 50 Bingo Playlist",
  description: "Manage your UFO 50 Bingo practice playlist!",
};

export default function PlaylistPage() {
  return <Playlist />;
}