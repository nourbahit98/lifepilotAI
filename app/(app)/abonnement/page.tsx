import { AppShell } from "@/components/app/app-shell";
import { SubscriptionManager } from "@/components/app/subscription-manager";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function SubscriptionPage() {
  const session = await requireUser("/abonnement");
  return (
    <AppShell configurationMissing={session.configurationMissing} profile={session.profile}>
      <SubscriptionManager />
    </AppShell>
  );
}
