"use client";

import { useState } from "react";

import { authFetch } from "@/components/app/client-api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { pricingPlans } from "@/lib/plans";

export function SubscriptionManager() {
  const [interval, setInterval] = useState<"monthly" | "yearly">("monthly");
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
      <div>
        <p className="text-sm font-medium text-neutral-700">Abonnement</p>
        <h1 className="mt-2 text-4xl font-semibold text-neutral-950">Beheer je abonnement.</h1>
      </div>
      <div className="flex gap-2">
        <Button onClick={() => setInterval("monthly")} type="button" variant={interval === "monthly" ? "primary" : "secondary"}>
          Maandelijks
        </Button>
        <Button onClick={() => setInterval("yearly")} type="button" variant={interval === "yearly" ? "primary" : "secondary"}>
          Jaarlijks
        </Button>
        <Button onClick={portal} type="button" variant="secondary">Facturen en opzeggen</Button>
      </div>
      {status ? <p className="rounded-lg bg-neutral-50 p-3 text-sm text-neutral-700">{status}</p> : null}
      <div className="grid gap-5 lg:grid-cols-3">
        {pricingPlans.map((plan) => (
          <Card key={plan.id}>
            <CardContent>
              <h2 className="text-xl font-semibold text-neutral-950">{plan.name}</h2>
              <p className="mt-2 text-sm text-neutral-600">{plan.description}</p>
              <ul className="mt-5 space-y-2 text-sm text-neutral-600">
                {plan.benefits.map((benefit) => <li key={benefit}>{benefit}</li>)}
              </ul>
              {plan.id === "free" ? (
                <Button className="mt-6 w-full" type="button" variant="secondary">Huidig basisplan</Button>
              ) : (
                <Button className="mt-6 w-full" onClick={() => checkout(plan.id)} type="button">
                  Upgrade naar {plan.name}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
