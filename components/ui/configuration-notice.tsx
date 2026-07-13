import { Card, CardContent } from "@/components/ui/card";
import { getServerConfigStatus } from "@/lib/env";

export function ConfigurationNotice() {
  const status = getServerConfigStatus();
  if (!status.missing.length && status.hasOpenAI && status.hasStripe) return null;

  return (
    <Card className="border-neutral-200 bg-neutral-50 shadow-none">
      <CardContent>
        <h2 className="text-base font-semibold text-neutral-950">Configuratie vereist</h2>
        <p className="mt-2 text-sm leading-6 text-neutral-700">
          Externe koppelingen zijn volledig ingebouwd, maar vereisen omgevingsvariabelen.
        </p>
        <ul className="mt-3 space-y-1 text-sm text-neutral-700">
          {[...status.missing, !status.hasOpenAI && "OPENAI_API_KEY", !status.hasStripe && "STRIPE_SECRET_KEY"]
            .filter(Boolean)
            .map((key) => (
              <li key={String(key)}>{key}</li>
            ))}
        </ul>
      </CardContent>
    </Card>
  );
}
