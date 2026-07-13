import { planLimits, PlanId } from "@/lib/plans";
import { isMissingSupabaseResourceError } from "@/lib/supabase/errors";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

export function currentBillingPeriod(date = new Date()) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

export async function assertUsageAllowed(
  userId: string,
  plan: PlanId,
  usageType: "ai_command" | "upload" | "export",
) {
  const supabase = createSupabaseServiceClient();
  const billingPeriod = currentBillingPeriod();
  const limit =
    usageType === "ai_command"
      ? planLimits[plan].aiCommands
      : usageType === "upload"
        ? planLimits[plan].uploads
        : planLimits[plan].aiCommands;

  const { data, error } = await supabase
    .from("usage_records")
    .select("amount")
    .eq("user_id", userId)
    .eq("usage_type", usageType)
    .eq("billing_period", billingPeriod);

  if (error) {
    if (isMissingSupabaseResourceError(error)) {
      return { limit, remaining: limit, used: 0 };
    }
    throw new Error("Abonnement kon niet worden gecontroleerd.");
  }

  const used = data.reduce((sum, record) => sum + Number(record.amount || 0), 0);
  if (used >= limit) {
    throw new Error(
      usageType === "ai_command"
        ? "Je hebt je AI-opdrachten voor deze maand gebruikt. Upgrade om verder te gaan."
        : "Je uploadlimiet voor deze maand is bereikt. Upgrade om meer documenten te uploaden.",
    );
  }

  return { limit, remaining: limit - used, used };
}

export async function recordUsage(
  userId: string,
  usageType: "ai_command" | "upload" | "export",
  amount = 1,
) {
  const supabase = createSupabaseServiceClient();
  const { error } = await supabase.from("usage_records").insert({
    amount,
    billing_period: currentBillingPeriod(),
    usage_type: usageType,
    user_id: userId,
  });
  if (error) {
    if (isMissingSupabaseResourceError(error)) return;
    throw new Error("Gebruik kon niet worden opgeslagen.");
  }
}
