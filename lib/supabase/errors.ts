type SupabaseLikeError = {
  code?: string;
  message?: string;
  name?: string;
};

export function isMissingSupabaseResourceError(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const { code, message, name } = error as SupabaseLikeError;
  const text = `${code ?? ""} ${message ?? ""} ${name ?? ""}`.toLowerCase();

  return [
    "42p01",
    "pgrst205",
    "pgrst204",
    "bucket not found",
    "could not find",
    "does not exist",
    "relation",
    "schema cache",
  ].some((signal) => text.includes(signal));
}

export function setupRequiredResponse(error: string, status = 200) {
  return Response.json({ error, setupRequired: true }, { status });
}
