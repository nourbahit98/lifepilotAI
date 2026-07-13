import { NextRequest } from "next/server";

import { getSupabaseConfig } from "@/lib/env";
import { createSupabaseServiceClient, createSupabaseUserClient } from "@/lib/supabase/server";

export async function requireApiUser(request: NextRequest) {
  const config = getSupabaseConfig();
  if (!config.url || !config.anonKey || !config.serviceRoleKey) {
    return {
      error: Response.json(
        {
          error:
            "Supabase is niet geconfigureerd. Vul NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY en SUPABASE_SERVICE_ROLE_KEY in.",
        },
        { status: 503 },
      ),
      profile: null,
      serviceSupabase: null,
      user: null,
      userSupabase: null,
    };
  }

  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) {
    return {
      error: Response.json({ error: "Je moet ingelogd zijn." }, { status: 401 }),
      profile: null,
      serviceSupabase: null,
      user: null,
      userSupabase: null,
    };
  }

  const userSupabase = createSupabaseUserClient(token);
  const { data, error } = await userSupabase.auth.getUser(token);
  if (error || !data.user) {
    return {
      error: Response.json({ error: "Sessie is verlopen. Log opnieuw in." }, { status: 401 }),
      profile: null,
      serviceSupabase: null,
      user: null,
      userSupabase: null,
    };
  }

  const serviceSupabase = createSupabaseServiceClient();
  const { data: profile } = await serviceSupabase
    .from("profiles")
    .select("*")
    .eq("id", data.user.id)
    .single();

  if (profile?.blocked_at) {
    return {
      error: Response.json({ error: "Dit account is geblokkeerd." }, { status: 403 }),
      profile: null,
      serviceSupabase: null,
      user: null,
      userSupabase: null,
    };
  }

  return {
    error: null,
    profile,
    serviceSupabase,
    user: data.user,
    userSupabase,
  };
}
