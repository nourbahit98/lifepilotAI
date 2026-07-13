import Stripe from "stripe";

import { getEnv, getPublicAppUrl } from "@/lib/env";
import { BillingInterval, PlanId } from "@/lib/plans";

export function getStripe() {
  const secretKey = getEnv("STRIPE_SECRET_KEY");
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY ontbreekt.");
  }
  return new Stripe(secretKey);
}

export function getPriceId(plan: Exclude<PlanId, "free">, interval: BillingInterval) {
  const key =
    plan === "premium"
      ? interval === "monthly"
        ? "STRIPE_PRICE_PREMIUM_MONTHLY"
        : "STRIPE_PRICE_PREMIUM_YEARLY"
      : interval === "monthly"
        ? "STRIPE_PRICE_PREMIUM_PLUS_MONTHLY"
        : "STRIPE_PRICE_PREMIUM_PLUS_YEARLY";
  const priceId = getEnv(key);
  if (!priceId) {
    throw new Error(`${key} ontbreekt.`);
  }
  return priceId;
}

export function checkoutUrls() {
  const appUrl = getPublicAppUrl();
  return {
    cancel_url: `${appUrl}/abonnement?checkout=cancelled`,
    success_url: `${appUrl}/abonnement?checkout=success`,
  };
}
