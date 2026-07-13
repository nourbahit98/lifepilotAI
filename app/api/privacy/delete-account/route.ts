import { NextRequest } from "next/server";

import { requireApiUser } from "@/lib/api-auth";

export async function POST(request: NextRequest) {
  const auth = await requireApiUser(request);
  if (auth.error) return auth.error;

  const body = await request.json().catch(() => ({}));
  if (body.confirmation !== "VERWIJDER MIJN ACCOUNT") {
    return Response.json({ error: "Bevestiging klopt niet." }, { status: 400 });
  }

  const [{ data: documents }, { data: generatedFiles }] = await Promise.all([
    auth.serviceSupabase
      .from("documents")
      .select("storage_path")
      .eq("user_id", auth.user.id),
    auth.serviceSupabase
      .from("generated_files")
      .select("storage_path")
      .eq("user_id", auth.user.id),
  ]);

  const documentPaths = documents?.map((document) => document.storage_path) ?? [];
  const generatedPaths = generatedFiles?.map((file) => file.storage_path) ?? [];
  if (documentPaths.length) {
    await auth.serviceSupabase.storage.from("documents").remove(documentPaths);
  }
  if (generatedPaths.length) {
    await auth.serviceSupabase.storage.from("generated-files").remove(generatedPaths);
  }

  const { error } = await auth.serviceSupabase.auth.admin.deleteUser(auth.user.id);
  if (error) return Response.json({ error: "Account kon niet worden verwijderd." }, { status: 500 });

  return Response.json({ ok: true });
}
