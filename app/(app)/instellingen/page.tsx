import { AppShell } from "@/components/app/app-shell";
import { SettingsWorkspace } from "@/components/app/settings-workspace";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await requireUser("/instellingen");
  return (
    <AppShell configurationMissing={session.configurationMissing} profile={session.profile}>
      <SettingsWorkspace />
    </AppShell>
  );
}
