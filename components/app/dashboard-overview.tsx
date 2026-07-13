import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { examplePrompts } from "@/lib/modules";
import { planLimits, PlanId } from "@/lib/plans";

export function DashboardOverview({
  profile,
}: {
  profile?: { full_name?: string | null; subscription_plan?: string | null } | null;
}) {
  const plan = (profile?.subscription_plan ?? "free") as PlanId;
  return (
    <>
      <section>
        <p className="text-sm font-medium text-blue-700">Dashboard</p>
        <h1 className="mt-2 text-4xl font-semibold text-slate-950">
          Goedemorgen, {profile?.full_name || "Nour"}. Wat wil je vandaag regelen?
        </h1>
        <div className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-950">Vraag LifePilot om iets te regelen...</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {examplePrompts.slice(0, 6).map((prompt) => (
              <Button asChild key={prompt} variant="secondary">
                <Link href={`/assistant?prompt=${encodeURIComponent(prompt)}`}>{prompt}</Link>
              </Button>
            ))}
          </div>
        </div>
      </section>
      <section className="grid gap-5 lg:grid-cols-3">
        <Panel title="Vandaag" items={["09:30 Brief controleren", "13:00 Klantmail afronden", "16:30 Planning bijwerken"]} />
        <Panel title="Recent" items={["Huurbrief samengevat", "Maandbudget gemaakt", "E-mail concept opgeslagen"]} />
        <Card>
          <CardHeader>
            <h2 className="text-base font-semibold text-slate-950">Gebruik</h2>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3 text-sm text-slate-600">
              <div className="flex justify-between"><dt>AI-opdrachten</dt><dd>0 / {planLimits[plan].aiCommands}</dd></div>
              <div className="flex justify-between"><dt>Uploads</dt><dd>0 / {planLimits[plan].uploads}</dd></div>
              <div className="flex justify-between"><dt>Abonnement</dt><dd>{plan}</dd></div>
            </dl>
          </CardContent>
        </Card>
      </section>
    </>
  );
}

function Panel({ items, title }: { items: string[]; title: string }) {
  return (
    <Card>
      <CardHeader>
        <h2 className="text-base font-semibold text-slate-950">{title}</h2>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {items.map((item) => (
            <li className="rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600" key={item}>
              {item}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
