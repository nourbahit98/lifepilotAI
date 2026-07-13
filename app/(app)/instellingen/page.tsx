import { AppShell } from "@/components/app/app-shell";
import { SimpleAppPage } from "@/components/app/simple-page";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await requireUser("/instellingen");
  return (
    <AppShell configurationMissing={session.configurationMissing} profile={session.profile}>
      <SimpleAppPage
        description="Instellingen bevatten taal, geheugen, automatische documentverwijdering, exportvoorkeuren en beveiligingsopties."
        title="Instellingen"
      />
    </AppShell>
  );
}
