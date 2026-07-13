import { Suspense } from "react";

import { AuthForm } from "@/components/auth/auth-form";
import { SiteHeader } from "@/components/public/site-header";
import { ConfigurationNotice } from "@/components/ui/configuration-notice";

export default function LoginPage() {
  return (
    <main>
      <SiteHeader />
      <section className="mx-auto grid min-h-[calc(100vh-64px)] max-w-7xl gap-8 px-5 py-12 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <h2 className="text-4xl font-semibold text-slate-950">Welkom terug.</h2>
          <p className="mt-4 max-w-md leading-7 text-slate-600">
            Log in om je gesprekken, documenten, planning en abonnement te beheren.
          </p>
          <div className="mt-6">
            <ConfigurationNotice />
          </div>
        </div>
        <Suspense fallback={<div className="text-sm text-slate-600">Inlogformulier laden...</div>}>
          <AuthForm mode="login" />
        </Suspense>
      </section>
    </main>
  );
}
