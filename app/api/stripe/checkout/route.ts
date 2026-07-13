import { NextRequest } from "next/server";
import { z } from "zod";

import { requireApiUser } from "@/lib/api-auth";
import { checkoutUrls, getPriceId, getStripe } from "@/lib/billing/stripe";

const checkoutSchema = z.object({
  interval: z.enum(["monthly", "yearly"]),
  plan: z.enum(["premium", "premium_plus"]),
});

export async function POST(request: NextRequest) {
  const auth = await requireApiUser(request);
  if (auth.error) return auth.error;
  const parsed = checkoutSchema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: "Ongeldig abonnement." }, { status: 400 });

  try {
    const stripe = getStripe();
    let customerId = auth.profile?.stripe_customer_id as string | null;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: auth.user.email ?? undefined,
        metadata: { user_id: auth.user.id },
        name: auth.profile?.full_name ?? undefined,
      });
      customerId = customer.id;
      await auth.serviceSupabase
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", auth.user.id);
    }

    const session = await stripe.checkout.sessions.create({
      ...checkoutUrls(),
      allow_promotion_codes: true,
      customer: customerId,
      line_items: [{ price: getPriceId(parsed.data.plan, parsed.data.interval), quantity: 1 }],
      mode: "subscription",
      subscription_data: {
        metadata: {
          interval: parsed.data.interval,
          plan: parsed.data.plan,
          user_id: auth.user.id,
        },
      },
    });

    return Response.json({ url: session.url });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Stripe Checkout kon niet worden gestart." },
      { status: 503 },
    );
  }
}
