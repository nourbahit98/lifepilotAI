import { NextRequest } from "next/server";
import { z } from "zod";

import { requireApiUser } from "@/lib/api-auth";
import { generateAssistantResult } from "@/lib/openai/assistant";
import { routeWithOpenAI } from "@/lib/openai/router";
import { PlanId } from "@/lib/plans";
import { assertUsageAllowed, recordUsage } from "@/lib/usage";

const requestSchema = z.object({
  conversationId: z.string().uuid().optional(),
  documents: z.array(z.string()).default([]),
  prompt: z.string().min(2).max(8000),
});

export async function POST(request: NextRequest) {
  const auth = await requireApiUser(request);
  if (auth.error) return auth.error;

  const parsed = requestSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json({ error: "Ongeldige opdracht." }, { status: 400 });
  }

  const userId = auth.user.id;
  const plan = (auth.profile?.subscription_plan ?? "free") as PlanId;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`),
        );
      };

      try {
        send("status", "Opdracht analyseren");
        await assertUsageAllowed(userId, plan, "ai_command");

        const router = await routeWithOpenAI(parsed.data.prompt, parsed.data.documents.length > 0);
        send("router", router);

        if (router.requires_files) {
          send("error", "Deze opdracht heeft minimaal één document nodig.");
          controller.close();
          return;
        }

        send("status", parsed.data.documents.length ? "Document uitlezen" : "Antwoord opstellen");
        const result = await generateAssistantResult({
          documents: parsed.data.documents,
          prompt: parsed.data.prompt,
          router,
        });

        const { data: conversation } = parsed.data.conversationId
          ? await auth.serviceSupabase
              .from("conversations")
              .update({ selected_module: router.intent, title: result.title })
              .eq("id", parsed.data.conversationId)
              .eq("user_id", userId)
              .select()
              .single()
          : await auth.serviceSupabase
              .from("conversations")
              .insert({
                selected_module: router.intent,
                title: result.title,
                user_id: userId,
              })
              .select()
              .single();

        if (conversation) {
          await auth.serviceSupabase.from("messages").insert([
            {
              content: parsed.data.prompt,
              conversation_id: conversation.id,
              role: "user",
              user_id: userId,
            },
            {
              content: result.full_result,
              conversation_id: conversation.id,
              metadata: { result, router },
              role: "assistant",
              user_id: userId,
            },
          ]);
        }

        await recordUsage(userId, "ai_command");
        send("result", { conversationId: conversation?.id, result, router });
      } catch (error) {
        send("error", error instanceof Error ? error.message : "AI-service is tijdelijk niet bereikbaar.");
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Content-Type": "text/event-stream; charset=utf-8",
    },
  });
}
