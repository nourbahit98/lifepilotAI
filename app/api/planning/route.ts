import { NextRequest } from "next/server";
import { z } from "zod";

import { requireApiUser } from "@/lib/api-auth";
import { isMissingSupabaseResourceError } from "@/lib/supabase/errors";

const planningSchema = z.object({
  description: z.string().max(1000).optional(),
  end_datetime: z.string().datetime().optional().nullable(),
  id: z.string().uuid().optional(),
  priority: z.enum(["low", "normal", "high"]).default("normal"),
  start_datetime: z.string().datetime().optional().nullable(),
  status: z.enum(["todo", "in_progress", "done", "moved"]).default("todo"),
  title: z.string().min(1).max(160),
});

export async function GET(request: NextRequest) {
  const auth = await requireApiUser(request);
  if (auth.error) return auth.error;

  const { data, error } = await auth.userSupabase
    .from("planning_items")
    .select("*")
    .order("start_datetime", { ascending: true });

  if (error) {
    if (isMissingSupabaseResourceError(error)) {
      return Response.json({
        items: [],
        setupRequired: true,
        error: "Planningdatabase is nog niet ingericht.",
      });
    }
    return Response.json({ error: "Planning kon niet worden geladen." }, { status: 500 });
  }
  return Response.json({ items: data ?? [] });
}

export async function POST(request: NextRequest) {
  const auth = await requireApiUser(request);
  if (auth.error) return auth.error;
  const parsed = planningSchema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: "Planningitem is ongeldig." }, { status: 400 });

  const { id, ...item } = parsed.data;
  const query = id
    ? auth.userSupabase.from("planning_items").update(item).eq("id", id).select().single()
    : auth.userSupabase
        .from("planning_items")
        .insert({ ...item, source: "manual", user_id: auth.user.id })
        .select()
        .single();

  const { data, error } = await query;
  if (error) {
    if (isMissingSupabaseResourceError(error)) {
      return Response.json({
        item: {
          ...item,
          created_at: new Date().toISOString(),
          id: id ?? crypto.randomUUID(),
          source: "local",
          user_id: auth.user.id,
        },
        setupRequired: true,
      });
    }
    return Response.json({ error: "Planning kon niet worden opgeslagen." }, { status: 500 });
  }
  return Response.json({ item: data });
}

export async function DELETE(request: NextRequest) {
  const auth = await requireApiUser(request);
  if (auth.error) return auth.error;
  const id = request.nextUrl.searchParams.get("id");
  if (!id) return Response.json({ error: "Planningitem ontbreekt." }, { status: 400 });
  const { error } = await auth.userSupabase.from("planning_items").delete().eq("id", id);
  if (error) {
    if (isMissingSupabaseResourceError(error)) {
      return Response.json({ ok: true, setupRequired: true });
    }
    return Response.json({ error: "Planningitem kon niet worden verwijderd." }, { status: 500 });
  }
  return Response.json({ ok: true });
}
