import { AppShell } from "@/components/app/app-shell";
import { SimpleAppPage } from "@/components/app/simple-page";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await requireUser("/profiel");
  return (
    <AppShell configurationMissing={session.configurationMissing} profile={session.profile}>
      <SimpleAppPage
        description="Profielgegevens worden opgeslagen in de profiles-tabel. Naam, taal en onboardingstatus zijn door de gebruiker bewerkbaar; abonnement en rol worden server-side beheerd."
        title="Profiel"
      />
    </AppShell>
  );
}
