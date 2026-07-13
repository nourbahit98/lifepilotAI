import Link from "next/link";

import { Button } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200/70 bg-white/88 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link className="flex items-center gap-3" href="/">
          <span className="grid h-9 w-9 place-items-center rounded-lg border border-neutral-300 bg-neutral-100 text-sm font-semibold text-neutral-950">
            LP
          </span>
          <span className="text-sm font-semibold text-neutral-950">LifePilot AI</span>
        </Link>
        <div className="hidden items-center gap-7 text-sm text-neutral-600 md:flex">
          <Link href="/functies">Functies</Link>
          <Link href="/prijzen">Prijzen</Link>
          <Link href="/privacybeleid">Privacy</Link>
        </div>
        <div className="flex items-center gap-3">
          <Link className="hidden text-sm text-neutral-600 sm:inline" href="/inloggen">
            Inloggen
          </Link>
          <Button asChild>
            <Link href="/registreren">Probeer gratis</Link>
          </Button>
        </div>
      </nav>
    </header>
  );
}
