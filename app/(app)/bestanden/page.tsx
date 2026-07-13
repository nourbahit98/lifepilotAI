import { AppShell } from "@/components/app/app-shell";
import { SimpleAppPage } from "@/components/app/simple-page";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function FilesPage() {
  const session = await requireUser("/bestanden");
  return (
    <AppShell configurationMissing={session.configurationMissing} profile={session.profile}>
      <SimpleAppPage
        description="Gegenereerde PDF-, Word-, Excel- en CSV-bestanden worden via de exportroute aangemaakt en in Supabase Storage opgeslagen."
        title="Gemaakte bestanden"
      />
    </AppShell>
  );
}
