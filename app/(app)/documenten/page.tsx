import { AppShell } from "@/components/app/app-shell";
import { DocumentsWorkspace } from "@/components/app/documents-workspace";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DocumentsPage() {
  const session = await requireUser("/documenten");
  return (
    <AppShell configurationMissing={session.configurationMissing} profile={session.profile}>
      <DocumentsWorkspace />
    </AppShell>
  );
}
