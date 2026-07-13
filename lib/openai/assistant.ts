import { getEnv } from "@/lib/env";
import { DOCUMENT_BOUNDARY_PROMPT, LIFE_PILOT_SYSTEM_PROMPT } from "@/lib/openai/prompts";
import { AIRouterResult, AssistantResult } from "@/lib/types";

export async function generateAssistantResult({
  documents,
  prompt,
  router,
}: {
  documents: string[];
  prompt: string;
  router: AIRouterResult;
}): Promise<AssistantResult> {
  if (!getEnv("OPENAI_API_KEY")) {
    return localAssistantResult(prompt, router, documents);
  }

  const { default: OpenAI } = await import("openai");
  const openai = new OpenAI({ apiKey: getEnv("OPENAI_API_KEY") });
  const documentContext = documents.length
    ? `${DOCUMENT_BOUNDARY_PROMPT}\n\n${documents.join("\n\n--- DOCUMENT ---\n\n")}`
    : "Geen documentcontext meegegeven.";

  const response = await openai.responses.create({
    input: [
      `Gebruikersopdracht: ${prompt}`,
      `Router: ${JSON.stringify(router)}`,
      `Documentcontext: ${documentContext}`,
    ].join("\n\n"),
    instructions: LIFE_PILOT_SYSTEM_PROMPT,
    model: "gpt-5.6-terra",
    text: {
      format: {
        name: "lifepilot_result",
        schema: {
          additionalProperties: false,
          properties: {
            full_result: { type: "string" },
            generated_files: {
              items: {
                additionalProperties: false,
                properties: {
                  file_type: { type: "string" },
                  title: { type: "string" },
                },
                required: ["title", "file_type"],
                type: "object",
              },
              type: "array",
            },
            important_information: { items: { type: "string" }, type: "array" },
            recommended_actions: { items: { type: "string" }, type: "array" },
            summary: { type: "string" },
            title: { type: "string" },
            warning: { type: "string" },
          },
          required: [
            "title",
            "summary",
            "important_information",
            "recommended_actions",
            "full_result",
            "warning",
            "generated_files",
          ],
          type: "object",
        },
        strict: true,
        type: "json_schema",
      },
    },
  });

  return JSON.parse(response.output_text || "{}") as AssistantResult;
}

function localAssistantResult(
  prompt: string,
  router: AIRouterResult,
  documents: string[],
): AssistantResult {
  const hasDocument = documents.some(Boolean);
  const warning =
    router.risk_level === "high"
      ? "Deze analyse vervangt geen professioneel juridisch, medisch of financieel advies."
      : "";

  return {
    full_result: [
      `Opdracht: ${prompt}`,
      `Module: ${router.intent}`,
      hasDocument
        ? "Het document is veilig als onvertrouwde inhoud behandeld. Controleer bedragen, datums en namen voordat je actie onderneemt."
        : "Voeg extra context toe als je een specifieker resultaat wilt.",
      "Volgende stap: controleer de voorgestelde acties en sla het resultaat op bij je gesprek.",
    ].join("\n\n"),
    generated_files: router.output_type === "chat" ? [] : [{ file_type: router.output_type, title: "LifePilot resultaat" }],
    important_information: router.detected_deadlines.length
      ? router.detected_deadlines.map((date) => `Mogelijke datum of deadline: ${date}`)
      : ["Geen harde deadline gevonden."],
    recommended_actions: router.suggested_actions,
    summary:
      "LifePilot heeft je opdracht gerouteerd en een direct bruikbaar resultaat voorbereid. Vul OPENAI_API_KEY in voor volledige AI-generatie.",
    title: "LifePilot resultaat",
    warning,
  };
}
