import StandardBoardCover from "@/app/StandardBoardCover";
import { SyncedTimerState } from "./useSyncedTimer";
import CountdownCoverContent from "./CountdownCoverContent";

type Props = {
  timerState: SyncedTimerState;
  isCast: boolean;
  isBoardVisibleByDefault: boolean;
  forceReveal: () => unknown;
};

export default function SyncedTimerBoardCover({
  timerState,
  isCast,
  forceReveal,
  isBoardVisibleByDefault,
}: Props) {
  const timerType = timerState.type;
  switch (timerType) {
    case "running":
      return null;
    case "not_started":
      if (isBoardVisibleByDefault || timerState.isForceRevealed) {
        return null;
      }
      return (
        <StandardBoardCover
          onReveal={isCast ? forceReveal : undefined}
          content={
            <>
              The board will be revealed automatically
              <br />
              when a countdown is started.
              {isCast && (
                <>
                  <br />
                  <br />
                  You may also click here to reveal.
                </>
              )}
            </>
          }
        />
      );
    case "countdown":
      return (
        <StandardBoardCover
          isTranslucent={timerState.isForceRevealed || timerState.wasPaused}
          hasRedBorder={timerState.wasPaused}
          content={
            <CountdownCoverContent
              endTime={timerState.endTime}
              intro={
                timerState.wasPaused ? "Resume play in" : "Automatic reveal in"
              }
            />
          }
        />
      );
    case "paused":
      if (timerState.isForceRevealed) {
        return null;
      }
      return (
        <StandardBoardCover
          onReveal={forceReveal}
          isTranslucent={true}
          hasRedBorder={true}
          content={
            <>
              Pause requested
              {timerState.pauseRequester != null && (
                <> by {timerState.pauseRequester}</>
              )}
              !<br />
              Please pause your game and coordinate in chat.
              <br />
              <br />
              The board will be revealed automatically
              <br />
              when a countdown is started.
              <br />
              <br />
              You may also click here to reveal the board.
            </>
          }
        />
      );
    default:
      timerType satisfies never;
      return null;
  }
}
