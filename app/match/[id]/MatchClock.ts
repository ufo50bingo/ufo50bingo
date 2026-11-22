import { NewFeed, NewFeedItem } from "@/app/fetchFeed";

export const DEFAULT_CLOCK_START_SECONDS = -60;

export class MatchClock {
  hasStarted = false;
  accumulated = DEFAULT_CLOCK_START_SECONDS;
  runningSince: null | number = null;
  endTime: null | number = null;

  apply(item: NewFeedItem): void {
    if (this.endTime != null) {
      return;
    }
    if (item.type === "end_game") {
      this.stop(item.time);
      this.endTime = item.time;
      return;
    }
    if (item.type !== "timer_event") {
      return;
    }
    switch (item.event) {
      case "set_duration":
        this.accumulated = item.duration ?? DEFAULT_CLOCK_START_SECONDS;
        if (this.runningSince != null) {
          this.runningSince = item.time;
        }
        return;
      case "pause":
        this.stop(item.time);
        return;
      case "start":
        this.hasStarted = true;
        this.runningSince ??= item.time;
        return;
      default:
        item.event satisfies never;
        return;
    }
  }

  valueAt(time: number): number {
    return (
      this.accumulated +
      (this.runningSince != null ? Math.max(time - this.runningSince, 0) : 0)
    );
  }

  getZeroTime(): null | number {
    if (this.runningSince == null) {
      return null;
    }
    return Math.max(this.runningSince - this.accumulated, this.runningSince);
  }

  stop(time: number): void {
    if (this.runningSince != null) {
      this.accumulated += Math.max(time - this.runningSince, 0);
      this.runningSince = null;
    }
  }
}

export function getClockZeroTime(feed: NewFeed): null | number {
  const clock = new MatchClock();
  for (const item of feed) {
    const zeroTime = clock.getZeroTime();
    if (zeroTime != null && zeroTime <= item.time) {
      return zeroTime;
    }
    clock.apply(item);
  }
  return clock.getZeroTime();
}
