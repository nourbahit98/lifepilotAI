import { NextRequest } from "next/server";

import { requireApiUser } from "@/lib/api-auth";
import { planLimits, PlanId } from "@/lib/plans";
import { extractText, validateUpload } from "@/lib/security/files";
import { assertUsageAllowed, recordUsage } from "@/lib/usage";

export async function GET(request: NextRequest) {
  const auth = await requireApiUser(request);
  if (auth.error) return auth.error;

  const { data, error } = await auth.userSupabase
    .from("documents")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return Response.json({ error: "Documenten konden niet worden geladen." }, { status: 500 });
  return Response.json({ documents: data });
}

export async function POST(request: NextRequest) {
  const auth = await requireApiUser(request);
  if (auth.error) return auth.error;

  const plan = (auth.profile?.subscription_plan ?? "free") as PlanId;
  const formData = await request.formData();
  const files = formData.getAll("files").filter((value): value is File => value instanceof File);

  if (!files.length) {
    return Response.json({ error: "Selecteer minimaal één bestand." }, { status: 400 });
  }

  const uploaded = [];
  for (const file of files) {
    validateUpload(file, planLimits[plan].maxFileMb);
    await assertUsageAllowed(auth.user.id, plan, "upload");

    let extractedText = "";
    let analysisStatus = "processed";
    try {
      extractedText = await extractText(file);
    } catch {
      analysisStatus = "failed";
    }

    const safeName = file.name.replace(/[^\w.\-]+/g, "-");
    const storagePath = `${auth.user.id}/${crypto.randomUUID()}-${safeName}`;
    const { error: uploadError } = await auth.serviceSupabase.storage
      .from("documents")
      .upload(storagePath, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      return Response.json({ error: "Bestand kon niet worden opgeslagen." }, { status: 500 });
    }

    const { data, error } = await auth.serviceSupabase
      .from("documents")
      .insert({
        analysis_status: analysisStatus,
        extracted_text: extractedText,
        file_type: file.type,
        filename: file.name,
        storage_path: storagePath,
        user_id: auth.user.id,
      })
      .select()
      .single();

    if (error) {
      return Response.json({ error: "Documentmetadata kon niet worden opgeslagen." }, { status: 500 });
    }

    await recordUsage(auth.user.id, "upload");
    uploaded.push(data);
  }

  return Response.json({ documents: uploaded });
}
