import { z } from "zod";

import { getEnv } from "@/lib/env";
import { AIRouterResult, LifePilotIntent, OutputType, RiskLevel } from "@/lib/types";

const intentSchema = z.enum([
  "planning",
  "document_analysis",
  "writing",
  "comparison",
  "spreadsheet",
  "finance",
  "shopping",
  "general",
]);

export const aiRouterSchema = z.object({
  intent: intentSchema,
  secondary_intents: z.array(intentSchema).default([]),
  requires_files: z.boolean(),
  requires_clarification: z.boolean(),
  clarification_question: z.string(),
  output_type: z.enum(["chat", "pdf", "docx", "xlsx", "csv", "calendar"]),
  risk_level: z.enum(["low", "medium", "high"]),
  detected_deadlines: z.array(z.string()),
  suggested_actions: z.array(z.string()),
});

const keywordRules: Array<{
  intent: LifePilotIntent;
  keywords: string[];
  output?: OutputType;
  risk?: RiskLevel;
  requiresFiles?: boolean;
}> = [
  { intent: "planning", keywords: ["plan", "week", "agenda", "deadline"], output: "calendar" },
  {
    intent: "document_analysis",
    keywords: ["brief", "document", "contract", "uitleg", "analyseer"],
    requiresFiles: true,
    risk: "medium",
  },
  { intent: "writing", keywords: ["schrijf", "email", "e-mail", "brief", "reactie", "klacht"] },
  {
    intent: "comparison",
    keywords: ["vergelijk", "verschillen", "verzekering", "contract"],
    requiresFiles: true,
    risk: "medium",
  },
  { intent: "spreadsheet", keywords: ["excel", "xlsx", "csv", "spreadsheet", "urenregistratie"], output: "xlsx" },
  { intent: "finance", keywords: ["budget", "inkomen", "uitgaven", "spaar", "financ"], output: "xlsx", risk: "medium" },
  { intent: "shopping", keywords: ["boodschap", "maaltijd", "recept", "dieet", "allerg"], output: "chat" },
];

export function routeWithRules(input: string, hasFiles = false): AIRouterResult {
  const normalized = input.toLowerCase();
  const matched = keywordRules.filter((rule) =>
    rule.keywords.some((keyword) => normalized.includes(keyword)),
  );

  const primary = matched[0];
  const secondary = matched
    .slice(1)
    .map((rule) => rule.intent)
    .filter((intent, index, list) => list.indexOf(intent) === index);

  const outputType =
    normalized.includes("pdf")
      ? "pdf"
      : normalized.includes("word") || normalized.includes("docx")
        ? "docx"
        : normalized.includes("csv")
          ? "csv"
          : primary?.output ?? "chat";

  const riskLevel: RiskLevel =
    normalized.includes("juridisch") ||
    normalized.includes("medisch") ||
    normalized.includes("verzekering") ||
    normalized.includes("schuld")
      ? "high"
      : primary?.risk ?? "low";

  return {
    clarification_question: "",
    detected_deadlines: extractDateHints(input),
    intent: primary?.intent ?? "general",
    output_type: outputType,
    requires_clarification: false,
    requires_files: Boolean(primary?.requiresFiles && !hasFiles),
    risk_level: riskLevel,
    secondary_intents: secondary,
    suggested_actions: suggestActions(primary?.intent ?? "general"),
  };
}

export async function routeWithOpenAI(input: string, hasFiles = false) {
  const apiKey = getEnv("OPENAI_API_KEY");
  if (!apiKey) return routeWithRules(input, hasFiles);

  const { default: OpenAI } = await import("openai");
  const openai = new OpenAI({ apiKey });
  const fallback = routeWithRules(input, hasFiles);

  const response = await openai.responses.create({
    input: `Analyseer deze LifePilot-opdracht en retourneer uitsluitend JSON.\n\nOpdracht: ${input}\nHeeft bestanden: ${hasFiles ? "ja" : "nee"}`,
    instructions:
      "Je routeert een SaaS-assistent-opdracht naar de juiste LifePilot-module. Gebruik Nederlands voor vragen en acties.",
    model: "gpt-5.6-terra",
    text: {
      format: {
        name: "lifepilot_ai_router",
        schema: {
          additionalProperties: false,
          properties: {
            clarification_question: { type: "string" },
            detected_deadlines: { items: { type: "string" }, type: "array" },
            intent: { enum: intentSchema.options, type: "string" },
            output_type: {
              enum: ["chat", "pdf", "docx", "xlsx", "csv", "calendar"],
              type: "string",
            },
            requires_clarification: { type: "boolean" },
            requires_files: { type: "boolean" },
            risk_level: { enum: ["low", "medium", "high"], type: "string" },
            secondary_intents: { items: { enum: intentSchema.options, type: "string" }, type: "array" },
            suggested_actions: { items: { type: "string" }, type: "array" },
          },
          required: [
            "intent",
            "secondary_intents",
            "requires_files",
            "requires_clarification",
            "clarification_question",
            "output_type",
            "risk_level",
            "detected_deadlines",
            "suggested_actions",
          ],
          type: "object",
        },
        strict: true,
        type: "json_schema",
      },
    },
  });

  const parsed = aiRouterSchema.safeParse(JSON.parse(response.output_text || "{}"));
  return parsed.success ? parsed.data : fallback;
}

function extractDateHints(input: string) {
  const dateMatches = input.match(/\b(\d{1,2}[-/]\d{1,2}[-/]\d{2,4}|\d{1,2}\s+[a-z]+)\b/gi);
  return dateMatches ?? [];
}

function suggestActions(intent: LifePilotIntent) {
  const actions: Record<LifePilotIntent, string[]> = {
    comparison: ["Upload minimaal twee documenten.", "Controleer opvallende verschillen."],
    document_analysis: ["Upload het document.", "Controleer belangrijke datum en gevraagde actie."],
    finance: ["Vul inkomsten en vaste lasten aan.", "Exporteer het overzicht naar Excel."],
    general: ["Stel je vraag concreet.", "Voeg bestanden toe als ze nodig zijn."],
    planning: ["Voeg deadlines toe.", "Kies dag-, week- of lijstweergave."],
    shopping: ["Vul aantal personen en budget in.", "Vink producten af tijdens het winkelen."],
    spreadsheet: ["Controleer kolommen en formules.", "Download XLSX of CSV."],
    writing: ["Kies toon en tekstsoort.", "Controleer namen en datums voor verzending."],
  };
  return actions[intent];
}
