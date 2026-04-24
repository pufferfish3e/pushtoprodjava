import { createClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "@/lib/supabase/config";

type AccessTokenProvider = () => Promise<string | null>;

export function createBrowserSupabaseClient(accessToken: AccessTokenProvider) {
  const { url, publishableKey } = getSupabaseEnv();

  return createClient(url, publishableKey, {
    accessToken,
  });
}
