import { getHost, VodHost } from "./vodUtil";

export default function getBaseUrlAndHost(
  vodUrl: null | undefined | string
): null | [string, VodHost] {
  if (vodUrl == null) {
    return null;
  }
  try {
    const url = new URL(vodUrl);
    const host = getHost(url);
    if (host == null) {
      return null;
    }
    url.searchParams.delete("t");
    return [url.toString(), host];
  } catch {
    return null;
  }
}
