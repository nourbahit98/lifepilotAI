"use client";

import { CheckCircle2, CreditCard, Sparkles } from "lucide-react";
import { useState } from "react";

import { authFetch } from "@/components/app/client-api";
import { Button } from "@/components/ui/button";
import { priceLabel, pricingPlans, type BillingInterval, type PlanId } from "@/lib/plans";

export function SubscriptionManager({ currentPlan }: { currentPlan?: string | null }) {
  const [interval, setInterval] = useState<BillingInterval>("monthly");
  const [status, setStatus] = useState("");

  async function checkout(plan: "premium" | "premium_plus") {
    const response = await authFetch("/api/stripe/checkout", {
      body: JSON.stringify({ interval, plan }),
      method: "POST",
    });
    const payload = await response.json();
    if (payload.url) window.location.assign(payload.url);
    else setStatus(payload.error || "Checkout kon niet worden gestart.");
  }

  async function portal() {
    const response = await authFetch("/api/stripe/portal", { method: "POST" });
    const payload = await response.json();
    if (payload.url) window.location.assign(payload.url);
    else setStatus(payload.error || "Customer Portal kon niet worden geopend.");
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-neutral-700">Abonnement</p>
          <h1 className="mt-2 text-4xl font-semibold text-neutral-950">Kies hoeveel LifePilot mag doen.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600">
            Upgrade wanneer je meer AI-opdrachten, uploads en exports nodig hebt.
          </p>
        </div>
        <Button onClick={portal} type="button" variant="secondary">
          <CreditCard aria-hidden className="h-4 w-4" />
          Facturen
        </Button>
      </div>

      <div className="flex w-fit rounded-full border border-neutral-200 bg-white p-1 shadow-sm">
        <button
          className={`rounded-full px-4 py-2 text-sm font-semibold ${interval === "monthly" ? "bg-[#151515] text-white" : "text-neutral-600"}`}
          onClick={() => setInterval("monthly")}
          type="button"
        >
          Maandelijks
        </button>
        <button
          className={`rounded-full px-4 py-2 text-sm font-semibold ${interval === "yearly" ? "bg-[#151515] text-white" : "text-neutral-600"}`}
          onClick={() => setInterval("yearly")}
          type="button"
        >
          Jaarlijks
        </button>
      </div>

      {status ? <p className="rounded-lg bg-neutral-50 p-3 text-sm text-neutral-700">{status}</p> : null}

      <div className="grid gap-4 lg:grid-cols-3">
        {pricingPlans.map((plan) => (
          <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm" key={plan.id}>
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold text-neutral-950">{plan.name}</h2>
              {plan.id === currentPlan ? (
                <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-700">
                  Actief
                </span>
              ) : null}
            </div>
            <p className="mt-3 text-3xl font-semibold text-neutral-950">
              {priceLabel(interval === "monthly" ? plan.monthly : plan.yearly, interval)}
            </p>
            <p className="mt-3 min-h-12 text-sm leading-6 text-neutral-600">{plan.description}</p>
            <ul className="mt-5 space-y-2 text-sm text-neutral-600">
              {plan.benefits.map((benefit) => (
                <li className="flex gap-2" key={benefit}>
                  <CheckCircle2 aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-neutral-950" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
            {plan.id === "free" || plan.id === currentPlan ? (
              <Button className="mt-6 w-full" type="button" variant="secondary">
                {plan.id === currentPlan ? "Huidig plan" : "Basisplan"}
              </Button>
            ) : (
              <Button className="mt-6 w-full" onClick={() => checkout(plan.id as Exclude<PlanId, "free">)} type="button">
                <Sparkles aria-hidden className="h-4 w-4" />
                Upgrade naar {plan.name}
              </Button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
