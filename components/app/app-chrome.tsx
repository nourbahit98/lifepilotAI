"use client";

import {
  Bot,
  CalendarDays,
  CreditCard,
  FileText,
  FolderOpen,
  Gauge,
  LockKeyhole,
  PanelLeft,
  Plus,
  Settings,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

import { SignOutButton } from "@/components/app/sign-out-button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", icon: Gauge, label: "Dashboard" },
  { href: "/assistant", icon: Bot, label: "Assistent" },
  { href: "/planning", icon: CalendarDays, label: "Planning" },
  { href: "/documenten", icon: FileText, label: "Documenten" },
  { href: "/bestanden", icon: FolderOpen, label: "Bestanden" },
  { href: "/abonnement", icon: CreditCard, label: "Abonnement" },
  { href: "/profiel", icon: UserRound, label: "Profiel" },
  { href: "/privacy-en-gegevens", icon: LockKeyhole, label: "Privacy" },
  { href: "/instellingen", icon: Settings, label: "Instellingen" },
];

export function AppChrome({
  children,
  configurationMissing,
  profile,
}: {
  children: ReactNode;
  configurationMissing?: boolean;
  profile?: { full_name?: string | null; email?: string | null; subscription_plan?: string | null } | null;
}) {
  const pathname = usePathname();
  const displayName = profile?.full_name || profile?.email || "LifePilot";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <main className="min-h-screen bg-[#f7f7f5] text-neutral-950">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-neutral-200 bg-[#f0f0ee] px-3 py-3 lg:flex lg:flex-col">
        <div className="flex items-center justify-between px-2 py-2">
          <Link className="flex min-w-0 items-center gap-3" href="/dashboard">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-neutral-300 bg-white text-sm font-semibold text-neutral-950 shadow-sm">
              LP
            </span>
            <span className="truncate text-sm font-semibold">LifePilot AI</span>
          </Link>
          <span className="grid h-9 w-9 place-items-center rounded-lg text-neutral-500">
            <PanelLeft aria-hidden className="h-4 w-4" />
          </span>
        </div>

        <Link
          className="mt-3 flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#151515] px-4 text-sm font-semibold text-white shadow-[0_14px_34px_rgba(0,0,0,0.16)] transition hover:bg-black"
          href="/assistant"
        >
          <Plus aria-hidden className="h-4 w-4" />
          Nieuwe opdracht
        </Link>

        <nav className="mt-4 flex-1 space-y-1 overflow-y-auto pr-1">
          {navItems.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                className={cn(
                  "flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium text-neutral-700 transition hover:bg-white hover:text-neutral-950",
                  active && "bg-white text-neutral-950 shadow-sm",
                )}
                href={href}
                key={href}
              >
                <Icon aria-hidden className="h-4 w-4 shrink-0" />
                <span className="truncate">{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-neutral-200 pt-3">
          <div className="mb-3 flex items-center gap-3 rounded-lg bg-white px-3 py-3 shadow-sm">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-neutral-100 text-xs font-semibold text-neutral-950">
              {initials || "LP"}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-neutral-950">{displayName}</p>
              <p className="truncate text-xs font-medium text-neutral-500">
                {profile?.subscription_plan ?? "configuratie"}
              </p>
            </div>
          </div>
          {!configurationMissing ? <SignOutButton /> : null}
        </div>
      </aside>

      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/90 backdrop-blur-xl lg:hidden">
        <div className="flex h-16 items-center justify-between px-4">
          <Link className="flex items-center gap-3" href="/dashboard">
            <span className="grid h-9 w-9 place-items-center rounded-lg border border-neutral-300 bg-neutral-100 text-sm font-semibold text-neutral-950">
              LP
            </span>
            <span className="text-sm font-semibold">LifePilot AI</span>
          </Link>
          <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-600">
            {profile?.subscription_plan ?? "configuratie"}
          </span>
        </div>
      </header>

      <div className="min-h-screen lg:pl-72">
        <section className="mx-auto w-full max-w-6xl space-y-6 px-4 py-5 pb-24 sm:px-6 lg:px-10 lg:py-8">
          {children}
        </section>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-5 border-t border-neutral-200 bg-white/95 px-2 py-2 text-center text-[11px] font-medium text-neutral-600 backdrop-blur lg:hidden">
        {navItems.slice(0, 5).map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              className={cn(
                "flex flex-col items-center justify-center gap-1 rounded-lg px-1 py-2 hover:bg-neutral-100",
                active && "bg-neutral-100 text-neutral-950",
              )}
              href={href}
              key={href}
            >
              <Icon aria-hidden className="h-4 w-4" />
              <span className="truncate">{label}</span>
            </Link>
          );
        })}
      </nav>
    </main>
  );
}
