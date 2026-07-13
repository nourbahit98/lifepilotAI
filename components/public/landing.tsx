import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { featureModules } from "@/lib/modules";
import { pricingPlans, priceLabel } from "@/lib/plans";

const demoRows = [
  ["Samenvatting", "De brief vraagt om een reactie op een voorgestelde wijziging."],
  ["Belangrijke datum", "Reageer uiterlijk 18 juli 2026."],
  ["Aanbevolen actie", "Vraag om onderbouwing en bewaar je reactie."],
  ["Conceptreactie", "Een nette bewerkbare reactie staat klaar."],
];

export function LandingPage() {
  return (
    <>
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <Badge>Persoonlijke SaaS-assistent</Badge>
          <h1 className="mt-5 text-balance text-5xl font-semibold leading-[1.04] text-slate-950 sm:text-6xl lg:text-7xl">
            Eén slimme assistent voor alles wat je moet regelen.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-8 text-slate-600">
            Plan je week, begrijp moeilijke documenten, schrijf professionele
            berichten en maak direct bruikbare bestanden vanuit één eenvoudige omgeving.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild>
              <Link href="/registreren">Probeer gratis</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="#demo">Bekijk hoe het werkt</Link>
            </Button>
          </div>
        </div>

        <Card className="mx-auto mt-14 max-w-5xl" id="demo">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">Interactieve productdemo</p>
              <h2 className="mt-1 text-xl font-semibold text-slate-950">Briefanalyse</h2>
            </div>
            <Badge className="bg-green-50 text-green-800">Klaar in 12 sec.</Badge>
          </CardHeader>
          <CardContent>
            <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-semibold text-slate-950">Vraag aan LifePilot</p>
                <p className="mt-4 text-lg leading-8 text-slate-800">
                  “Lees deze brief, vertel wat ik moet doen en schrijf een reactie.”
                </p>
              </div>
              <div className="space-y-3">
                {demoRows.map(([title, body], index) => (
                  <div className="animate-rise rounded-lg border border-slate-200 bg-white p-4" key={title}>
                    <div className="flex gap-4">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-green-50 text-sm font-semibold text-green-800">
                        {index + 1}
                      </span>
                      <div>
                        <h3 className="text-sm font-semibold text-slate-950">{title}</h3>
                        <p className="mt-1 text-sm leading-6 text-slate-600">{body}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="border-y border-slate-200 bg-white px-5 py-16 sm:px-8" id="functies">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <Badge>Functies</Badge>
            <h2 className="mt-4 text-4xl font-semibold text-slate-950">Alles vanuit één centrale invoer.</h2>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featureModules.map((feature) => (
              <Card className="shadow-none" key={feature.id}>
                <CardContent>
                  <h3 className="text-base font-semibold text-slate-950">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <PricingSection />
    </>
  );
}

export function PricingSection() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-24" id="prijzen">
      <div className="max-w-3xl">
        <Badge>Prijzen</Badge>
        <h2 className="mt-4 text-4xl font-semibold text-slate-950">Transparante abonnementen.</h2>
        <p className="mt-4 text-slate-600">Jaarlijks betalen geeft ongeveer 20% korting.</p>
      </div>
      <div className="mt-10 grid gap-5 lg:grid-cols-3">
        {pricingPlans.map((plan) => (
          <Card className={plan.badge ? "border-green-200 bg-green-50/30" : ""} key={plan.id}>
            <CardContent>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold text-slate-950">{plan.name}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{plan.description}</p>
                </div>
                {plan.badge ? <Badge>{plan.badge}</Badge> : null}
              </div>
              <p className="mt-6 text-3xl font-semibold text-slate-950">
                {priceLabel(plan.monthly, "monthly")}
              </p>
              <p className="mt-1 text-sm text-slate-500">{priceLabel(plan.yearly, "yearly")}</p>
              <ul className="mt-6 space-y-3">
                {plan.benefits.map((benefit) => (
                  <li className="text-sm leading-6 text-slate-700" key={benefit}>
                    {benefit}
                  </li>
                ))}
              </ul>
              <Button asChild className="mt-8 w-full" variant={plan.id === "free" ? "secondary" : "primary"}>
                <Link href={plan.id === "free" ? "/registreren" : "/abonnement"}>
                  {plan.id === "free" ? "Start gratis" : "Kies abonnement"}
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
