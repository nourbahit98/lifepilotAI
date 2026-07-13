import { AppShell } from "@/components/app/app-shell";
import { DashboardOverview } from "@/components/app/dashboard-overview";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await requireUser("/dashboard");
  return (
    <AppShell configurationMissing={session.configurationMissing} profile={session.profile}>
      <DashboardOverview profile={session.profile} />
    </AppShell>
  );
}
