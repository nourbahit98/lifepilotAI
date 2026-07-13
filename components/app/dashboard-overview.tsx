import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  SendHorizontal,
  Sparkles,
  Table2,
  type LucideIcon,
  WalletCards,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { examplePrompts } from "@/lib/modules";
import { planLimits, PlanId } from "@/lib/plans";

export function DashboardOverview({
  profile,
}: {
  profile?: { full_name?: string | null; subscription_plan?: string | null } | null;
}) {
  const plan = (profile?.subscription_plan ?? "free") as PlanId;
  const firstName = profile?.full_name?.split(" ").filter(Boolean)[0] || "Nour";
  const quickPrompts = [
    {
      href: `/assistant?prompt=${encodeURIComponent("Leg deze brief uit in eenvoudige taal.")}`,
      icon: FileText,
      label: "Leg een brief uit",
    },
    {
      href: `/assistant?prompt=${encodeURIComponent("Plan mijn werkweek van maandag tot vrijdag.")}`,
      icon: CalendarDays,
      label: "Plan mijn week",
    },
    {
      href: `/assistant?prompt=${encodeURIComponent("Maak een maandbudget met mijn inkomsten en vaste lasten.")}`,
      icon: WalletCards,
      label: "Maak een budget",
    },
    {
      href: `/assistant?prompt=${encodeURIComponent("Maak een Excel-bestand voor urenregistratie.")}`,
      icon: Table2,
      label: "Maak een Excel",
    },
  ];

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 lg:min-h-[calc(100vh-7rem)] lg:justify-center">
      <section className="mx-auto w-full max-w-3xl pt-2 text-center">
        <div className="mx-auto flex h-10 w-fit items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 text-sm font-semibold text-neutral-700 shadow-sm">
          <Sparkles aria-hidden className="h-4 w-4 text-neutral-950" />
          LifePilot AI
        </div>
        <h1 className="mt-7 text-4xl font-semibold tracking-normal text-neutral-950 sm:text-5xl">
          Waarmee kan ik helpen, {firstName}?
        </h1>
      </section>

      <section className="mx-auto w-full max-w-3xl">
        <form
          action="/assistant"
          className="rounded-lg border border-neutral-200 bg-white p-3 shadow-[0_22px_60px_rgba(0,0,0,0.08)]"
          method="get"
        >
          <textarea
            className="min-h-28 w-full resize-none rounded-lg border-0 bg-transparent px-3 py-3 text-base leading-7 text-neutral-950 outline-none placeholder:text-neutral-400"
            defaultValue={examplePrompts[0]}
            name="prompt"
            rows={3}
          />
          <div className="flex items-center justify-between gap-3 border-t border-neutral-100 px-1 pt-3">
            <div className="flex min-w-0 items-center gap-2 text-sm font-medium text-neutral-500">
              <span className="truncate">Klaar voor je volgende opdracht</span>
            </div>
            <Button aria-label="Verstuur opdracht" className="h-10 w-10 shrink-0 rounded-full px-0 py-0" type="submit">
              <SendHorizontal aria-hidden className="h-4 w-4" />
            </Button>
          </div>
        </form>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {quickPrompts.map(({ href, icon: Icon, label }) => (
            <Link
              className="group flex min-h-12 items-center justify-between gap-3 rounded-lg border border-neutral-200 bg-white px-4 text-sm font-semibold text-neutral-800 shadow-sm transition hover:border-neutral-300 hover:bg-neutral-50"
              href={href}
              key={label}
            >
              <span className="flex min-w-0 items-center gap-3">
                <Icon aria-hidden className="h-4 w-4 shrink-0 text-neutral-500" />
                <span className="truncate">{label}</span>
              </span>
              <ArrowRight aria-hidden className="h-4 w-4 shrink-0 text-neutral-400 transition group-hover:translate-x-0.5 group-hover:text-neutral-950" />
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-3 lg:grid-cols-3">
        <Panel
          icon={Clock3}
          items={["09:30 Brief controleren", "13:00 Klantmail afronden", "16:30 Planning bijwerken"]}
          title="Vandaag"
        />
        <Panel
          icon={CheckCircle2}
          items={["Huurbrief samengevat", "Maandbudget gemaakt", "E-mail concept opgeslagen"]}
          title="Recent"
        />
        <UsagePanel plan={plan} />
      </section>
    </div>
  );
}

function Panel({
  icon: Icon,
  items,
  title,
}: {
  icon: LucideIcon;
  items: string[];
  title: string;
}) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-neutral-100 text-neutral-950">
          <Icon aria-hidden className="h-4 w-4" />
        </span>
        <h2 className="text-sm font-semibold text-neutral-950">{title}</h2>
      </div>
      <ul className="mt-4 space-y-2">
        {items.map((item) => (
          <li className="rounded-lg bg-neutral-50 px-3 py-2 text-sm text-neutral-600" key={item}>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function UsagePanel({ plan }: { plan: PlanId }) {
  const limits = planLimits[plan];
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-neutral-100 text-neutral-950">
          <Sparkles aria-hidden className="h-4 w-4" />
        </span>
        <h2 className="text-sm font-semibold text-neutral-950">Gebruik</h2>
      </div>
      <dl className="mt-4 space-y-3 text-sm">
        <div>
          <div className="flex justify-between gap-3 text-neutral-600">
            <dt>AI-opdrachten</dt>
            <dd className="font-semibold text-neutral-950">0 / {limits.aiCommands}</dd>
          </div>
          <div className="mt-2 h-1.5 rounded-full bg-neutral-100">
            <div className="h-full w-0 rounded-full bg-neutral-950" />
          </div>
        </div>
        <div>
          <div className="flex justify-between gap-3 text-neutral-600">
            <dt>Uploads</dt>
            <dd className="font-semibold text-neutral-950">0 / {limits.uploads}</dd>
          </div>
          <div className="mt-2 h-1.5 rounded-full bg-neutral-100">
            <div className="h-full w-0 rounded-full bg-neutral-950" />
          </div>
        </div>
        <div className="flex justify-between gap-3 rounded-lg bg-neutral-50 px-3 py-2 text-neutral-600">
          <dt>Abonnement</dt>
          <dd className="font-semibold text-neutral-950">{plan}</dd>
        </div>
      </dl>
    </div>
  );
}
