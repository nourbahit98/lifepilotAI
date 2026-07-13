import { headers } from "next/headers";
import Stripe from "stripe";

import { getEnv } from "@/lib/env";
import { getStripe } from "@/lib/billing/stripe";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const signature = (await headers()).get("stripe-signature");
  const webhookSecret = getEnv("STRIPE_WEBHOOK_SECRET");
  if (!signature || !webhookSecret) {
    return Response.json({ error: "Stripe webhook is niet geconfigureerd." }, { status: 503 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(await request.text(), signature, webhookSecret);
  } catch {
    return Response.json({ error: "Webhookhandtekening is ongeldig." }, { status: 400 });
  }

  const supabase = createSupabaseServiceClient();

  if (
    [
      "customer.subscription.created",
      "customer.subscription.updated",
      "customer.subscription.deleted",
    ].includes(event.type)
  ) {
    const subscription = event.data.object as Stripe.Subscription;
    const period = subscription as unknown as {
      cancel_at_period_end?: boolean;
      current_period_end?: number;
      current_period_start?: number;
    };
    const userId = subscription.metadata.user_id;
    const plan = subscription.metadata.plan ?? "free";
    if (userId) {
      await supabase.from("subscriptions").upsert({
        cancel_at_period_end: Boolean(period.cancel_at_period_end),
        current_period_end: period.current_period_end
          ? new Date(period.current_period_end * 1000).toISOString()
          : null,
        current_period_start: period.current_period_start
          ? new Date(period.current_period_start * 1000).toISOString()
          : null,
        plan,
        status: subscription.status,
        stripe_price_id: subscription.items.data[0]?.price.id,
        stripe_subscription_id: subscription.id,
        user_id: userId,
      });
      await supabase.from("profiles").update({ subscription_plan: plan }).eq("id", userId);
    }
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.customer && session.metadata?.user_id) {
      await supabase
        .from("profiles")
        .update({ stripe_customer_id: String(session.customer) })
        .eq("id", session.metadata.user_id);
    }
  }

  if (event.type === "invoice.payment_failed") {
    const invoice = event.data.object as Stripe.Invoice;
    await supabase.from("security_events").insert({
      event_type: "invoice.payment_failed",
      metadata: { customer: invoice.customer, invoice: invoice.id },
      severity: "warning",
    });
  }

  if (event.type === "invoice.paid") {
    const invoice = event.data.object as Stripe.Invoice;
    await supabase.from("security_events").insert({
      event_type: "invoice.paid",
      metadata: { customer: invoice.customer, invoice: invoice.id },
      severity: "info",
    });
  }

  return Response.json({ received: true });
}
