import { NextRequest } from "next/server";
import { z } from "zod";

import { requireApiUser } from "@/lib/api-auth";
import { generateExportFile } from "@/lib/export/generators";
import { planLimits, PlanId } from "@/lib/plans";
import { recordUsage } from "@/lib/usage";

const exportSchema = z.object({
  content: z.string().min(1).max(50000),
  title: z.string().min(1).max(120),
  type: z.enum(["pdf", "docx", "xlsx", "csv"]),
});

export async function POST(request: NextRequest) {
  const auth = await requireApiUser(request);
  if (auth.error) return auth.error;

  const parsed = exportSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json({ error: "Export kon niet worden gegenereerd." }, { status: 400 });
  }

  const plan = (auth.profile?.subscription_plan ?? "free") as PlanId;
  if (!planLimits[plan].exports.includes(parsed.data.type)) {
    return Response.json(
      { error: "Deze export is niet beschikbaar in je huidige abonnement." },
      { status: 402 },
    );
  }

  const file = await generateExportFile(parsed.data);
  const filename = `${parsed.data.title.replace(/[^\w\-]+/g, "-")}.${file.extension}`;
  const storagePath = `${auth.user.id}/${crypto.randomUUID()}-${filename}`;

  await auth.serviceSupabase.storage
    .from("generated-files")
    .upload(storagePath, file.buffer, {
      contentType: file.contentType,
      upsert: false,
    });

  const { data } = await auth.serviceSupabase
    .from("generated_files")
    .insert({
      file_type: file.extension,
      storage_path: storagePath,
      title: parsed.data.title,
      user_id: auth.user.id,
    })
    .select()
    .single();

  await recordUsage(auth.user.id, "export");

  return new Response(file.buffer, {
    headers: {
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Type": file.contentType,
      "X-LifePilot-File-Id": data?.id ?? "",
    },
  });
}
