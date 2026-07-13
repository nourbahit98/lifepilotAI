import { AppShell } from "@/components/app/app-shell";
import { PrivacyDashboard } from "@/components/app/privacy-dashboard";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function PrivacyDashboardPage() {
  const session = await requireUser("/privacy-en-gegevens");
  return (
    <AppShell configurationMissing={session.configurationMissing} profile={session.profile}>
      <PrivacyDashboard />
    </AppShell>
  );
}
