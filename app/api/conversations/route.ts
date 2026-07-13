import { NextRequest } from "next/server";
import { z } from "zod";

import { requireApiUser } from "@/lib/api-auth";
import { isMissingSupabaseResourceError } from "@/lib/supabase/errors";

const patchSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(120).optional(),
});

export async function GET(request: NextRequest) {
  const auth = await requireApiUser(request);
  if (auth.error) return auth.error;

  const { data, error } = await auth.userSupabase
    .from("conversations")
    .select("*, messages(id, role, content, created_at)")
    .order("updated_at", { ascending: false });

  if (error) {
    if (isMissingSupabaseResourceError(error)) {
      return Response.json({
        conversations: [],
        setupRequired: true,
        error: "Gesprekkendatabase is nog niet ingericht.",
      });
    }
    return Response.json({ error: "Gesprekken konden niet worden geladen." }, { status: 500 });
  }
  return Response.json({ conversations: data ?? [] });
}

export async function PATCH(request: NextRequest) {
  const auth = await requireApiUser(request);
  if (auth.error) return auth.error;
  const parsed = patchSchema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: "Ongeldige wijziging." }, { status: 400 });

  const { data, error } = await auth.userSupabase
    .from("conversations")
    .update({ title: parsed.data.title })
    .eq("id", parsed.data.id)
    .select()
    .single();

  if (error) {
    if (isMissingSupabaseResourceError(error)) {
      return Response.json({ conversation: null, setupRequired: true });
    }
    return Response.json({ error: "Gesprek kon niet worden hernoemd." }, { status: 500 });
  }
  return Response.json({ conversation: data });
}

export async function DELETE(request: NextRequest) {
  const auth = await requireApiUser(request);
  if (auth.error) return auth.error;
  const id = request.nextUrl.searchParams.get("id");
  if (!id) return Response.json({ error: "Gesprek ontbreekt." }, { status: 400 });

  const { error } = await auth.userSupabase.from("conversations").delete().eq("id", id);
  if (error) {
    if (isMissingSupabaseResourceError(error)) {
      return Response.json({ ok: true, setupRequired: true });
    }
    return Response.json({ error: "Gesprek kon niet worden verwijderd." }, { status: 500 });
  }
  return Response.json({ ok: true });
}
