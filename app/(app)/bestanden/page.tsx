import { AppShell } from "@/components/app/app-shell";
import { FilesWorkspace } from "@/components/app/files-workspace";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function FilesPage() {
  const session = await requireUser("/bestanden");
  return (
    <AppShell configurationMissing={session.configurationMissing} profile={session.profile}>
      <FilesWorkspace />
    </AppShell>
  );
}
