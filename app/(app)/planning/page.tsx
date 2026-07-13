import { AppShell } from "@/components/app/app-shell";
import { PlanningWorkspace } from "@/components/app/planning-workspace";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function PlanningPage() {
  const session = await requireUser("/planning");
  return (
    <AppShell configurationMissing={session.configurationMissing} profile={session.profile}>
      <PlanningWorkspace />
    </AppShell>
  );
}
