import { NextRequest } from "next/server";
import { z } from "zod";

import { requireApiUser } from "@/lib/api-auth";
import { generateExportFile } from "@/lib/export/generators";
import { planLimits, PlanId } from "@/lib/plans";
import { isMissingSupabaseResourceError } from "@/lib/supabase/errors";
import { recordUsage } from "@/lib/usage";

const exportSchema = z.object({
  content: z.string().min(1).max(50000),
  title: z.string().min(1).max(120),
  type: z.enum(["pdf", "docx", "xlsx", "csv"]),
});

export async function GET(request: NextRequest) {
  const auth = await requireApiUser(request);
  if (auth.error) return auth.error;

  const { data, error } = await auth.serviceSupabase
    .from("generated_files")
    .select("id,title,file_type,storage_path,created_at")
    .eq("user_id", auth.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    if (isMissingSupabaseResourceError(error)) {
      return Response.json({
        files: [],
        setupRequired: true,
        error: "Bestandendatabase is nog niet ingericht.",
      });
    }
    return Response.json({ error: "Bestanden konden niet worden geladen." }, { status: 500 });
  }

  const files = await Promise.all(
    (data ?? []).map(async (file) => {
      const { data: signed } = await auth.serviceSupabase.storage
        .from("generated-files")
        .createSignedUrl(file.storage_path, 60 * 10);

      return {
        created_at: file.created_at,
        download_url: signed?.signedUrl ?? null,
        file_type: file.file_type,
        id: file.id,
        title: file.title,
      };
    }),
  );

  return Response.json({ files });
}

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

  const { error: uploadError } = await auth.serviceSupabase.storage
    .from("generated-files")
    .upload(storagePath, file.buffer, {
      contentType: file.contentType,
      upsert: false,
    });

  if (uploadError) {
    if (isMissingSupabaseResourceError(uploadError)) {
      return Response.json(
        {
          error: "Bestandenopslag is nog niet ingericht. Maak de Supabase Storage bucket `generated-files` aan.",
          setupRequired: true,
        },
        { status: 503 },
      );
    }
    return Response.json({ error: "Export kon niet worden opgeslagen." }, { status: 500 });
  }

  const { data, error: metadataError } = await auth.serviceSupabase
    .from("generated_files")
    .insert({
      file_type: file.extension,
      storage_path: storagePath,
      title: parsed.data.title,
      user_id: auth.user.id,
    })
    .select()
    .single();

  if (metadataError) {
    if (isMissingSupabaseResourceError(metadataError)) {
      return Response.json(
        {
          error: "Bestandendatabase is nog niet ingericht.",
          setupRequired: true,
        },
        { status: 503 },
      );
    }
    return Response.json({ error: "Exportmetadata kon niet worden opgeslagen." }, { status: 500 });
  }

  await recordUsage(auth.user.id, "export");

  return new Response(file.buffer, {
    headers: {
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Type": file.contentType,
      "X-LifePilot-File-Id": data?.id ?? "",
    },
  });
}
