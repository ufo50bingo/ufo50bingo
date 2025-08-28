import { Match } from "./Matches";

export type VodHost = "youtube" | "twitch";

export function getHost(url: URL): null | VodHost {
  if (url.hostname.includes("twitch.tv")) {
    return "twitch";
  } else if (
    url.hostname.includes("youtube.com") ||
    url.hostname.includes("youtu.be")
  ) {
    return "youtube";
  } else {
    return null;
  }
}

function getHrsMinsSecs(time: number): [number, number, number] {
  const hrs = Math.trunc(time / 3600);
  const remainingAfterHrs = time - 3600 * hrs;
  const mins = Math.trunc(remainingAfterHrs / 60);
  const remainingAfterMins = remainingAfterHrs - 60 * mins;
  const secs = Math.round(remainingAfterMins);
  return [hrs, mins, secs];
}

export function setUrlAtTime(
  host: VodHost,
  url: URL,
  startSeconds: number
): void {
  const seconds = Math.max(0, Math.round(startSeconds));
  switch (host) {
    case "youtube":
      url.searchParams.set("t", `${seconds}`);
      return;
    case "twitch":
      const [hrs, mins, secs] = getHrsMinsSecs(seconds);
      url.searchParams.set("t", `${hrs}h${mins}m${secs}s`);
  }
}

export function getVodLink(match: Match): string {
  try {
    const vod = match.vod;
    if (vod == null) {
      return "";
    }
    if (vod.startSeconds == null) {
      return vod.url;
    }
    const url = new URL(vod.url);
    const host = getHost(url);
    if (host == null) {
      return vod.url;
    }
    setUrlAtTime(host, url, vod.startSeconds);
    return url.toString();
  } catch {
    return "";
  }
}

function stripSuffix(withSuffix: null | undefined | string): null | number {
  if (withSuffix == null) {
    return null;
  }
  return Number(withSuffix.slice(0, -1));
}

function parseTwitchTime(time: string): null | number {
  const regex = /^(\d+h)?(\d+m)?(\d+s)?$/;
  const result = time.match(regex);
  if (result == null) {
    return null;
  }
  const hrs = stripSuffix(result[1]);
  const mins = stripSuffix(result[2]);
  const secs = stripSuffix(result[3]);

  if (hrs == null && mins == null && secs == null) {
    return null;
  }
  return (hrs ?? 0) * 3600 + (mins ?? 0) * 60 + (secs ?? 0);
}

function getStartSeconds(url: URL, host: VodHost): null | number {
  switch (host) {
    case "youtube":
      const seconds = url.searchParams.get("t");
      console.log(seconds);
      if (seconds == null || seconds === "") {
        return null;
      }
      return Number(seconds);
    case "twitch":
      const time = url.searchParams.get("t");
      if (time == null) {
        return null;
      }
      return parseTwitchTime(time);
  }
}

export function getBaseUrlAndStartSeconds(
  newVodLink: string
): [string, null | number] {
  try {
    const url = new URL(newVodLink);
    const host = getHost(url);
    if (host == null) {
      return [newVodLink, null];
    }
    const startSeconds = getStartSeconds(url, host);
    if (startSeconds == null) {
      return [newVodLink, null];
    }
    url.searchParams.delete("t");
    return [url.toString(), startSeconds];
  } catch {
    return [newVodLink, null];
  }
}

export function getWarning(
  oldVodLink: string,
  newVodLink: string
): null | [string, undefined | string] {
  if (oldVodLink === newVodLink) {
    return null;
  }
  if (newVodLink === "") {
    return ["Are you sure you want to delete this link?", undefined];
  }
  try {
    const url = new URL(newVodLink);
    const host = getHost(url);

    if (host == null) {
      return [
        `Unrecognized host ${url.hostname}`,
        "Expected youtube.com, youtu.be, or twitch.tv",
      ];
    }

    const time = getStartSeconds(url, host);
    if (time == null) {
      return [
        "No timestamp found in link.",
        "Follow the instructions above to copy a link at the correct time.",
      ];
    }

    if (time === 0) {
      return [
        "A timestamp is included, but it is 0.",
        "Did you pause at the start of the match before copying the VOD link?",
      ];
    }

    return null;
  } catch {
    return ["Failed to parse link", "Did you copy the whole link?"];
  }
}
