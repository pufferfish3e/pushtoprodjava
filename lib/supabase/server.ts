import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "@/lib/supabase/config";

export function createServerSupabaseClient() {
  const { url, publishableKey } = getSupabaseEnv();

  return createClient(url, publishableKey, {
    accessToken: async () => {
      const { getToken } = await auth();
      const token = await getToken();

      if (!token) {
        return null;
      }

      return token;
    },
  });
}
