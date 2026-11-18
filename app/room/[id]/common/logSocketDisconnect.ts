export type DisconnectCause =
  | { type: "ping_timeout"; msSincePing: number }
  | { type: "close"; code: number; reason: string; wasClean: boolean }
  | { type: "offline" };

export type SocketStats = {
  createdAt: number;
  openedAt: null | number;
  authenticatedAt: null | number;
  lastMessageAt: null | number;
  lastPongAt: null | number;
  messageCount: number;
  pingCount: number;
  pingSentAt: null | number;
  lastTickAt: null | number;
  longestTickGapMs: number;
  errorAt: null | number;
  lastHiddenAt: null | number;
  lastVisibleAt: null | number;
  lastFreezeAt: null | number;
  lastResumeAt: null | number;
  lastOnlineAt: null | number;
};

export function createSocketStats(): SocketStats {
  return {
    createdAt: Date.now(),
    openedAt: null,
    authenticatedAt: null,
    lastMessageAt: null,
    lastPongAt: null,
    messageCount: 0,
    pingCount: 0,
    pingSentAt: null,
    lastTickAt: null,
    longestTickGapMs: 0,
    errorAt: null,
    lastHiddenAt: null,
    lastVisibleAt: null,
    lastFreezeAt: null,
    lastResumeAt: null,
    lastOnlineAt: null,
  };
}

// https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent/code
const CLOSE_CODES: { [code: number]: string } = {
  1000: "normal closure",
  1001: "going away, e.g. the server shut down",
  1002: "protocol error",
  1003: "unsupported data",
  1005: "no status code received",
  1006: "abnormal closure, the connection dropped without a close frame",
  1007: "invalid message data",
  1008: "policy violation",
  1009: "message too big",
  1010: "missing extension",
  1011: "server error",
  1012: "service restart",
  1013: "try again later",
  1014: "bad gateway",
  1015: "TLS handshake failure",
};

export function getDisconnectSummary(cause: DisconnectCause): string {
  switch (cause.type) {
    case "ping_timeout":
      return `No reply to a ping for ${(cause.msSincePing / 1000).toFixed(1)}s`;
    case "close": {
      const description = CLOSE_CODES[cause.code] ?? "unknown code";
      const reason = cause.reason !== "" ? `, reason "${cause.reason}"` : "";
      const clean = cause.wasClean ? "" : ", not clean";
      return `Connection closed with code ${cause.code} (${description})${reason}${clean}`;
    }
    case "offline":
      return "The browser reported that it went offline";
    default:
      cause satisfies never;
      return "Unknown";
  }
}

type NetworkInformation = {
  type?: string;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
};

export default function logSocketDisconnect(
  socket: WebSocket,
  gameId: number,
  cause: DisconnectCause,
  stats: SocketStats,
): string {
  const now = Date.now();
  const msSince = (time: null | number) => (time == null ? null : now - time);
  const summary = getDisconnectSummary(cause);
  const connection = (
    navigator as Navigator & { connection?: NetworkInformation }
  ).connection;
  const details = {
    summary,
    cause,
    gameId,
    time: new Date(now).toISOString(),
    socket: {
      url: socket.url,
      readyState: socket.readyState,
      bufferedAmount: socket.bufferedAmount,
      protocol: socket.protocol,
      extensions: socket.extensions,
    },
    msSince: {
      created: msSince(stats.createdAt),
      opened: msSince(stats.openedAt),
      authenticated: msSince(stats.authenticatedAt),
      lastMessage: msSince(stats.lastMessageAt),
      lastPong: msSince(stats.lastPongAt),
      unansweredPing: msSince(stats.pingSentAt),
      lastHeartbeatTick: msSince(stats.lastTickAt),
      errorEvent: msSince(stats.errorAt),
      lastHidden: msSince(stats.lastHiddenAt),
      lastVisible: msSince(stats.lastVisibleAt),
      lastFreeze: msSince(stats.lastFreezeAt),
      lastResume: msSince(stats.lastResumeAt),
      lastOnline: msSince(stats.lastOnlineAt),
    },
    counts: {
      messages: stats.messageCount,
      pings: stats.pingCount,
    },
    longestHeartbeatTickGapMs: stats.longestTickGapMs,
    page: {
      visibilityState: document.visibilityState,
      hasFocus: document.hasFocus(),
      onLine: navigator.onLine,
      wasDiscarded:
        (document as Document & { wasDiscarded?: boolean }).wasDiscarded ??
        null,
    },
    network:
      connection == null
        ? null
        : {
            type: connection.type ?? null,
            effectiveType: connection.effectiveType ?? null,
            downlinkMbps: connection.downlink ?? null,
            rttMs: connection.rtt ?? null,
            saveData: connection.saveData ?? null,
          },
    userAgent: navigator.userAgent,
  };
  console.warn(`[socket] Disconnected: ${summary}`, details);
  console.warn(`[socket] Disconnect details: ${JSON.stringify(details)}`);
  return summary;
}
