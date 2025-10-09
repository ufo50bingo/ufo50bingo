import { createClient, SupabaseClient } from "@supabase/supabase-js";

let CLIENT: null | SupabaseClient<any, "public", "public", any, any> = null;

export default function getSupabaseClient(): SupabaseClient<any, "public", "public", any, any> {
  if (CLIENT != null) {
    return CLIENT
  }
  CLIENT = createClient(
    'https://wqiuxuxjvwmxpslsojni.supabase.co',
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndxaXV4dXhqdndteHBzbHNvam5pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5NTk5NjcsImV4cCI6MjA3NTUzNTk2N30.e61AbDKmWGSGPd4LGab9e4oPwNTg-wQnjvRf7Tgs4Ik",
  );
  return CLIENT;
}