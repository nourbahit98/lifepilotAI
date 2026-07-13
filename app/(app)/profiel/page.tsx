import { AppShell } from "@/components/app/app-shell";
import { ProfileWorkspace } from "@/components/app/profile-workspace";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await requireUser("/profiel");
  return (
    <AppShell configurationMissing={session.configurationMissing} profile={session.profile}>
      <ProfileWorkspace profile={session.profile} />
    </AppShell>
  );
}
