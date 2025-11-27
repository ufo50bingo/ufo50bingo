import { ProperGame } from "@/app/goals";

type Props = {
  game: ProperGame;
};

export default function PlayedGame({ game }: Props) {
  return (
    <img
      src={`/games/${game}.png`}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "contain",
        imageRendering: "pixelated",
      }}
    />
  );
}
