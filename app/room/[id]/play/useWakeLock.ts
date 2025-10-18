import { useEffect, useRef } from "react";

export default function useWakeLock(): void {
  const wakeLock = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    const isSupported =
      typeof window !== "undefined" && "wakeLock" in navigator;
    if (!isSupported) {
      return;
    }

    const acquireLock = async () => {
      if (wakeLock.current == null) {
        try {
          wakeLock.current = await navigator.wakeLock.request("screen");
          wakeLock.current.onrelease = () => {
            wakeLock.current = null;
          };
        } catch {}
      }
    };

    acquireLock();

    const handleVisibilityChange = async () => {
      if (document.visibilityState === "visible") {
        acquireLock();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (wakeLock.current != null) {
        wakeLock.current.release().then(() => {
          wakeLock.current = null;
        });
      }
    };
  }, []);
}
