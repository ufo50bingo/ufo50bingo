import Duration from "@/app/practice/Duration";
import RunningDuration from "@/app/practice/RunningDuration";
import { useServerOffsetContext } from "../ServerOffsetContext";
import { TPlayedGame } from "./PlayedGameState";

type Props = {
  recentGame: TPlayedGame;
};

// how long a played game has taken so far, ticking while it's running
export default function PlayedGameDuration({ recentGame }: Props) {
  const { getClientMsFromServerMs } = useServerOffsetContext();
  return recentGame.type === "running" ? (
    <RunningDuration
      curStartTime={getClientMsFromServerMs(
        recentGame.effectiveStartTime * 1000,
      )}
      accumulatedDuration={0}
      minDuration={recentGame.minDuration * 1000}
      showDecimal={false}
    />
  ) : (
    <Duration duration={recentGame.duration * 1000} showDecimal={false} />
  );
}
