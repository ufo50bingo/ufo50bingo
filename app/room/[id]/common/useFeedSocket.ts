import { USE_SUPABASE } from "./useSupabase";
import useBingosyncSocket from "./useBingosyncSocket";
import useSupabaseBingosyncSocket from "./useSupabaseBingosyncSocket";

const useFeedSocket = USE_SUPABASE
  ? useSupabaseBingosyncSocket
  : useBingosyncSocket;

export default useFeedSocket;
