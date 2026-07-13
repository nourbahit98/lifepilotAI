import { createBrowserClient } from "@supabase/ssr";

import { getSupabaseConfig } from "@/lib/env";

export function createSupabaseBrowserClient() {
  const config = getSupabaseConfig();
  if (!config.url || !config.anonKey) {
    throw new Error(
      "Supabase is niet geconfigureerd. Vul NEXT_PUBLIC_SUPABASE_URL en NEXT_PUBLIC_SUPABASE_ANON_KEY in.",
    );
  }

  return createBrowserClient(config.url, config.anonKey);
}
