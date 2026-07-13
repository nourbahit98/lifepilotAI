import { BadgeCheck, CreditCard, Mail, ShieldCheck, type LucideIcon, UserRound } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export function ProfileWorkspace({
  profile,
}: {
  profile?: {
    email?: string | null;
    full_name?: string | null;
    role?: string | null;
    subscription_plan?: string | null;
  } | null;
}) {
  const displayName = profile?.full_name || "LifePilot gebruiker";
  const plan = profile?.subscription_plan ?? "free";

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-neutral-700">Profiel</p>
          <h1 className="mt-2 text-4xl font-semibold text-neutral-950">{displayName}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600">
            Beheer je accountgegevens, abonnement en persoonlijke voorkeuren voor LifePilot AI.
          </p>
        </div>
        <Button asChild>
          <Link href="/instellingen">Voorkeuren aanpassen</Link>
        </Button>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <ProfileTile icon={UserRound} label="Naam" value={displayName} />
        <ProfileTile icon={Mail} label="E-mail" value={profile?.email || "Niet beschikbaar"} />
        <ProfileTile icon={CreditCard} label="Abonnement" value={plan} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_0.85fr]">
        <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <BadgeCheck aria-hidden className="h-4 w-4 text-neutral-950" />
            <h2 className="text-sm font-semibold text-neutral-950">Accountstatus</h2>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {[
              ["Authenticatie", "Actief"],
              ["Rol", profile?.role ?? "gebruiker"],
              ["Onboarding", "Klaar voor gebruik"],
              ["Data-isolatie", "Ingeschakeld"],
            ].map(([label, value]) => (
              <div className="rounded-lg bg-neutral-50 px-4 py-3" key={label}>
                <p className="text-xs font-semibold uppercase text-neutral-500">{label}</p>
                <p className="mt-1 text-sm font-semibold text-neutral-950">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <ShieldCheck aria-hidden className="h-4 w-4 text-neutral-950" />
            <h2 className="text-sm font-semibold text-neutral-950">Beveiliging</h2>
          </div>
          <p className="mt-4 text-sm leading-6 text-neutral-600">
            Je bestanden en gesprekken worden per account gescheiden. Privacy-export en accountverwijdering staan onder
            Privacy en gegevens.
          </p>
          <Button asChild className="mt-5" variant="secondary">
            <Link href="/privacy-en-gegevens">Privacy openen</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function ProfileTile({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
      <span className="grid h-9 w-9 place-items-center rounded-lg bg-neutral-100 text-neutral-950">
        <Icon aria-hidden className="h-4 w-4" />
      </span>
      <p className="mt-4 text-xs font-semibold uppercase text-neutral-500">{label}</p>
      <p className="mt-1 truncate text-sm font-semibold text-neutral-950">{value}</p>
    </div>
  );
}
