import { redirect } from "next/navigation";

import { getCurrentProfile, getCurrentUser, isSupabaseConfigured } from "@/lib/supabase/server";

export async function requireUser(returnTo = "/dashboard") {
  if (!isSupabaseConfigured()) {
    return {
      configurationMissing: true as const,
      profile: null,
      user: null,
    };
  }

  const user = await getCurrentUser();
  if (!user) {
    redirect(`/inloggen?returnTo=${encodeURIComponent(returnTo)}`);
  }

  const profile = await getCurrentProfile();
  return {
    configurationMissing: false as const,
    profile: { email: user.email, ...profile },
    user,
  };
}

export function isAdminProfile(profile: { role?: string | null } | null) {
  return profile?.role === "admin";
}
