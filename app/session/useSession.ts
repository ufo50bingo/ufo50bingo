import { useState, useEffect } from "react";
import readSessionClient from "./readSessionClient";
import { Session } from "./sessionUtil";

export default function useSession(): null | Session {
  const [session, setSession] = useState<null | Session>(null);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSession(readSessionClient());
  }, []);
  return session;
}
