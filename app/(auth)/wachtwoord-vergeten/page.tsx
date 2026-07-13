import { Suspense } from "react";

import { AuthForm } from "@/components/auth/auth-form";
import { SiteHeader } from "@/components/public/site-header";

export default function ForgotPasswordPage() {
  return (
    <main>
      <SiteHeader />
      <section className="mx-auto flex min-h-[calc(100vh-64px)] max-w-7xl items-center px-5 py-12 sm:px-8">
        <Suspense fallback={<div className="text-sm text-neutral-600">Formulier laden...</div>}>
          <AuthForm mode="forgot" />
        </Suspense>
      </section>
    </main>
  );
}
