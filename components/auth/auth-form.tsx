"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const authSchema = z.object({
  email: z.string().email("Vul een geldig e-mailadres in."),
  fullName: z.string().optional(),
  password: z.string().min(8, "Gebruik minimaal 8 tekens.").optional(),
});

type AuthFields = z.infer<typeof authSchema>;

export function AuthForm({ mode }: { mode: "login" | "register" | "forgot" }) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") || "/dashboard";
  const form = useForm<AuthFields>({
    resolver: zodResolver(authSchema),
    defaultValues: { email: "", fullName: "", password: "" },
  });

  async function onSubmit(values: AuthFields) {
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      if (mode === "register") {
        const { error: signUpError } = await supabase.auth.signUp({
          email: values.email,
          options: {
            data: { full_name: values.fullName },
            emailRedirectTo: `${window.location.origin}/dashboard`,
          },
          password: values.password ?? "",
        });
        if (signUpError) throw signUpError;
        setMessage("Registratie gelukt. Controleer je e-mail om je account te bevestigen.");
      }

      if (mode === "login") {
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email: values.email,
          password: values.password ?? "",
        });
        if (loginError) throw loginError;
        router.push(returnTo);
        router.refresh();
      }

      if (mode === "forgot") {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(values.email, {
          redirectTo: `${window.location.origin}/instellingen`,
        });
        if (resetError) throw resetError;
        setMessage("We hebben een herstel-link naar je e-mailadres gestuurd.");
      }
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Authenticatie is tijdelijk niet beschikbaar. Controleer je Supabase-configuratie.",
      );
    } finally {
      setLoading(false);
    }
  }

  const title =
    mode === "register"
      ? "Maak je LifePilot-account"
      : mode === "forgot"
        ? "Wachtwoord vergeten"
        : "Log in bij LifePilot AI";

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardContent>
        <h1 className="text-3xl font-semibold text-slate-950">{title}</h1>
        <form className="mt-8 space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          {mode === "register" ? (
            <label className="block text-sm font-medium text-slate-700">
              Naam
              <Input className="mt-2" {...form.register("fullName")} autoComplete="name" />
            </label>
          ) : null}
          <label className="block text-sm font-medium text-slate-700">
            E-mail
            <Input className="mt-2" {...form.register("email")} autoComplete="email" type="email" />
          </label>
          {mode !== "forgot" ? (
            <label className="block text-sm font-medium text-slate-700">
              Wachtwoord
              <Input
                className="mt-2"
                {...form.register("password")}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                type="password"
              />
            </label>
          ) : null}
          <Button className="w-full" disabled={loading} type="submit">
            {loading
              ? "Bezig..."
              : mode === "register"
                ? "Registreren"
                : mode === "forgot"
                  ? "Herstel-link sturen"
                  : "Inloggen"}
          </Button>
        </form>
        {message ? <p className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-800">{message}</p> : null}
        {error ? <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p> : null}
        <div className="mt-6 flex justify-between text-sm text-slate-600">
          {mode !== "login" ? <Link href="/inloggen">Inloggen</Link> : <Link href="/registreren">Registreren</Link>}
          {mode !== "forgot" ? <Link href="/wachtwoord-vergeten">Wachtwoord vergeten</Link> : null}
        </div>
      </CardContent>
    </Card>
  );
}
