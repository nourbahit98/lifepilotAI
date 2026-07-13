const requiredServerKeys = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
] as const;

export function getEnv(name: string) {
  return process.env[name]?.trim() || "";
}

export function missingEnv(keys: readonly string[]) {
  return keys.filter((key) => !getEnv(key));
}

export function getPublicAppUrl() {
  return getEnv("NEXT_PUBLIC_APP_URL") || "http://localhost:3000";
}

export function getSupabaseConfig() {
  const url = getEnv("NEXT_PUBLIC_SUPABASE_URL");
  const anonKey = getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  const serviceRoleKey = getEnv("SUPABASE_SERVICE_ROLE_KEY");

  return {
    anonKey,
    isConfigured: Boolean(url && anonKey),
    serviceRoleKey,
    url,
  };
}

export function getServerConfigStatus() {
  return {
    missing: missingEnv(requiredServerKeys),
    supabase: getSupabaseConfig(),
    hasOpenAI: Boolean(getEnv("OPENAI_API_KEY")),
    hasStripe: Boolean(getEnv("STRIPE_SECRET_KEY")),
  };
}
