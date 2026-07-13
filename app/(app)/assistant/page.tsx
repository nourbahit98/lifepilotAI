import { Suspense } from "react";

import { AppShell } from "@/components/app/app-shell";
import { AssistantWorkspace } from "@/components/app/assistant-workspace";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AssistantPage() {
  const session = await requireUser("/assistant");
  return (
    <AppShell configurationMissing={session.configurationMissing} profile={session.profile}>
      <Suspense fallback={<div className="text-sm text-neutral-600">Assistent laden...</div>}>
        <AssistantWorkspace />
      </Suspense>
    </AppShell>
  );
}
