import { NextRequest } from "next/server";

import { requireApiUser } from "@/lib/api-auth";

export async function GET(request: NextRequest) {
  const auth = await requireApiUser(request);
  if (auth.error) return auth.error;

  const tables = [
    "profiles",
    "conversations",
    "messages",
    "documents",
    "generated_files",
    "planning_items",
    "user_memory",
    "subscriptions",
    "usage_records",
  ] as const;

  const exportData: Record<string, unknown> = {};
  for (const table of tables) {
    const query =
      table === "profiles"
        ? auth.userSupabase.from(table).select("*").eq("id", auth.user.id)
        : auth.userSupabase.from(table).select("*").eq("user_id", auth.user.id);
    const { data } = await query;
    exportData[table] = data ?? [];
  }

  return Response.json({
    exported_at: new Date().toISOString(),
    user_id: auth.user.id,
    ...exportData,
  });
}
