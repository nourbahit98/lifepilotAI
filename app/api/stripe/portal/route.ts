import { NextRequest } from "next/server";

import { requireApiUser } from "@/lib/api-auth";
import { getStripe } from "@/lib/billing/stripe";
import { getPublicAppUrl } from "@/lib/env";

export async function POST(request: NextRequest) {
  const auth = await requireApiUser(request);
  if (auth.error) return auth.error;

  if (!auth.profile?.stripe_customer_id) {
    return Response.json({ error: "Er is nog geen Stripe-klant gekoppeld." }, { status: 400 });
  }

  try {
    const session = await getStripe().billingPortal.sessions.create({
      customer: auth.profile.stripe_customer_id,
      return_url: `${getPublicAppUrl()}/abonnement`,
    });
    return Response.json({ url: session.url });
  } catch {
    return Response.json({ error: "Stripe Customer Portal kon niet worden geopend." }, { status: 503 });
  }
}
