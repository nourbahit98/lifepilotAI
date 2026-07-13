export type PlanId = "free" | "premium" | "premium_plus";
export type BillingInterval = "monthly" | "yearly";

export const planLimits: Record<
  PlanId,
  {
    aiCommands: number;
    uploads: number;
    maxFileMb: number;
    exports: Array<"pdf" | "docx" | "xlsx" | "csv">;
  }
> = {
  free: {
    aiCommands: 10,
    uploads: 3,
    maxFileMb: 10,
    exports: ["pdf", "csv"],
  },
  premium: {
    aiCommands: 150,
    uploads: 30,
    maxFileMb: 25,
    exports: ["pdf", "docx", "xlsx", "csv"],
  },
  premium_plus: {
    aiCommands: 500,
    uploads: 100,
    maxFileMb: 50,
    exports: ["pdf", "docx", "xlsx", "csv"],
  },
};

export const pricingPlans = [
  {
    id: "free" as const,
    name: "Gratis",
    monthly: 0,
    yearly: 0,
    description: "Voor gebruikers die LifePilot willen ontdekken.",
    benefits: [
      "10 AI-opdrachten per maand",
      "3 documentuploads per maand",
      "Basis weekplanner",
      "Tekstassistent",
      "Geen exports naar Word of Excel",
    ],
  },
  {
    id: "premium" as const,
    name: "Premium",
    monthly: 9.99,
    yearly: 95.9,
    badge: "Meest gekozen",
    description: "Voor dagelijks persoonlijk gebruik.",
    benefits: [
      "150 AI-opdrachten per maand",
      "30 documentuploads per maand",
      "PDF-, Word-, Excel- en CSV-export",
      "Documentanalyse",
      "Agenda-integratie",
      "Persoonlijk geheugen",
      "Geen advertenties",
    ],
  },
  {
    id: "premium_plus" as const,
    name: "Premium Plus",
    monthly: 19.99,
    yearly: 191.9,
    description: "Voor intensief gebruik en zelfstandigen.",
    benefits: [
      "500 AI-opdrachten per maand",
      "100 documentuploads per maand",
      "Uitgebreide automatiseringen",
      "Financiële assistent",
      "Hogere bestandslimieten",
      "Prioriteitsverwerking",
      "Geschikt voor zelfstandigen",
    ],
  },
];

export function priceLabel(amount: number, interval: BillingInterval) {
  if (amount === 0) return "€0";
  const formatted = new Intl.NumberFormat("nl-NL", {
    currency: "EUR",
    style: "currency",
  }).format(amount);
  return `${formatted} / ${interval === "monthly" ? "maand" : "jaar"}`;
}
