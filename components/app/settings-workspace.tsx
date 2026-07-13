"use client";

import { Bell, Brain, Download, Languages, Moon, ShieldCheck, SlidersHorizontal } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

const settings = [
  {
    description: "Gebruik Nederlandse labels, datumweergave en exportnamen.",
    icon: Languages,
    label: "Taal",
    value: "Nederlands",
  },
  {
    description: "Laat LifePilot voorkeuren onthouden voor betere vervolgopdrachten.",
    icon: Brain,
    label: "Persoonlijk geheugen",
    value: "Aan",
  },
  {
    description: "Krijg meldingen voor taken, verlopen documenten en exports.",
    icon: Bell,
    label: "Meldingen",
    value: "Slim",
  },
  {
    description: "Kies standaard PDF, Word, Excel of CSV voor resultaten.",
    icon: Download,
    label: "Exportvoorkeur",
    value: "PDF",
  },
  {
    description: "Documenten worden alleen gebruikt voor je opdracht en gescheiden opgeslagen.",
    icon: ShieldCheck,
    label: "Privacy-modus",
    value: "Strikt",
  },
  {
    description: "De app blijft lichtgrijs/wit met zwarte acties.",
    icon: Moon,
    label: "Thema",
    value: "Light",
  },
];

export function SettingsWorkspace() {
  const [saved, setSaved] = useState(false);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-neutral-700">Instellingen</p>
          <h1 className="mt-2 text-4xl font-semibold text-neutral-950">Stel LifePilot in op jouw manier.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600">
            Deze voorkeuren bereiden de app voor op geheugen, meldingen, exportdefaults en privacyregels.
          </p>
        </div>
        <Button
          onClick={() => {
            window.localStorage.setItem("lifepilot-settings-saved", new Date().toISOString());
            setSaved(true);
          }}
          type="button"
        >
          Voorkeuren opslaan
        </Button>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {settings.map(({ description, icon: Icon, label, value }) => (
          <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm" key={label}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-neutral-100 text-neutral-950">
                  <Icon aria-hidden className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <h2 className="text-sm font-semibold text-neutral-950">{label}</h2>
                  <p className="mt-1 text-sm leading-6 text-neutral-600">{description}</p>
                </div>
              </div>
              <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-700">
                {value}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <SlidersHorizontal aria-hidden className="h-4 w-4" />
          <h2 className="text-sm font-semibold text-neutral-950">Geavanceerd</h2>
        </div>
        <p className="mt-3 text-sm leading-6 text-neutral-600">
          API-koppelingen, Stripe, Supabase en OpenAI worden server-side via omgevingsvariabelen beheerd.
        </p>
        {saved ? <p className="mt-4 text-sm font-medium text-neutral-700">Voorkeuren lokaal opgeslagen.</p> : null}
      </div>
    </section>
  );
}
