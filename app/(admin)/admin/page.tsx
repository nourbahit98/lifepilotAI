import { AppShell } from "@/components/app/app-shell";
import { SimpleAppPage } from "@/components/app/simple-page";
import { isAdminProfile, requireUser } from "@/lib/auth";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await requireUser("/admin");
  if (!session.configurationMissing && !isAdminProfile(session.profile)) {
    return (
      <AppShell profile={session.profile}>
        <SimpleAppPage
          description="Alleen gebruikers met role = admin mogen deze omgeving openen."
          title="Geen toegang"
        />
      </AppShell>
    );
  }

  let stats = { ai: 0, subscriptions: 0, uploads: 0, users: 0 };
  if (!session.configurationMissing) {
    const supabase = createSupabaseServiceClient();
    const [users, subscriptions, ai, uploads] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("subscriptions").select("id", { count: "exact", head: true }).neq("plan", "free"),
      supabase.from("usage_records").select("id", { count: "exact", head: true }).eq("usage_type", "ai_command"),
      supabase.from("documents").select("id", { count: "exact", head: true }),
    ]);
    stats = {
      ai: ai.count ?? 0,
      subscriptions: subscriptions.count ?? 0,
      uploads: uploads.count ?? 0,
      users: users.count ?? 0,
    };
  }

  return (
    <AppShell configurationMissing={session.configurationMissing} profile={session.profile}>
      <section>
        <p className="text-sm font-medium text-green-700">Admin</p>
        <h1 className="mt-2 text-4xl font-semibold text-neutral-950">Beveiligde adminomgeving</h1>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(stats).map(([label, value]) => (
            <div className="rounded-lg border border-neutral-200 bg-white p-5" key={label}>
              <p className="text-sm text-neutral-600">{label}</p>
              <p className="mt-2 text-3xl font-semibold text-neutral-950">{value}</p>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
