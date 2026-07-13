import Link from "next/link";
import { ReactNode } from "react";

import { SignOutButton } from "@/components/app/sign-out-button";
import { ConfigurationNotice } from "@/components/ui/configuration-notice";

const navItems = [
  ["Dashboard", "/dashboard"],
  ["Assistent", "/assistant"],
  ["Planning", "/planning"],
  ["Documenten", "/documenten"],
  ["Bestanden", "/bestanden"],
  ["Abonnement", "/abonnement"],
  ["Profiel", "/profiel"],
  ["Privacy", "/privacy-en-gegevens"],
  ["Instellingen", "/instellingen"],
];

export function AppShell({
  children,
  configurationMissing,
  profile,
}: {
  children: ReactNode;
  configurationMissing?: boolean;
  profile?: { full_name?: string | null; email?: string | null; subscription_plan?: string | null } | null;
}) {
  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-950">
      <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link className="flex items-center gap-3" href="/dashboard">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-neutral-950 text-sm font-semibold text-white">
              LP
            </span>
            <span className="text-sm font-semibold">LifePilot AI</span>
          </Link>
          <div className="hidden items-center gap-3 md:flex">
            <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-600">
              {profile?.subscription_plan ?? "configuratie"}
            </span>
            {!configurationMissing ? <SignOutButton /> : null}
          </div>
        </div>
      </header>
      <div className="mx-auto grid max-w-7xl gap-6 px-5 py-6 sm:px-8 lg:grid-cols-[220px_1fr]">
        <aside className="hidden lg:block">
          <nav className="sticky top-24 space-y-1">
            {navItems.map(([label, href]) => (
              <Link
                className="block rounded-lg px-4 py-3 text-sm font-medium text-neutral-600 hover:bg-white hover:text-neutral-950"
                href={href}
                key={href}
              >
                {label}
              </Link>
            ))}
          </nav>
        </aside>
        <section className="space-y-6">
          {configurationMissing ? <ConfigurationNotice /> : null}
          {children}
        </section>
      </div>
      <nav className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-5 border-t border-neutral-200 bg-white/95 px-3 py-2 text-center text-xs font-medium text-neutral-600 backdrop-blur lg:hidden">
        {navItems.slice(0, 5).map(([label, href]) => (
          <Link className="rounded-lg px-1 py-2 hover:bg-neutral-100" href={href} key={href}>
            {label}
          </Link>
        ))}
      </nav>
    </main>
  );
}
