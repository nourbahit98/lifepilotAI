"use client";

import { ArrowDownToLine, FileArchive, FileSpreadsheet, FileText, RefreshCw, Sparkles } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { authFetch } from "@/components/app/client-api";
import { Button } from "@/components/ui/button";

type GeneratedFile = {
  created_at?: string;
  download_url?: string | null;
  file_type: string;
  id: string;
  title: string;
};

function fileIcon(type: string) {
  if (["xlsx", "csv"].includes(type)) return FileSpreadsheet;
  if (["pdf", "docx"].includes(type)) return FileText;
  return FileArchive;
}

export function FilesWorkspace() {
  const [files, setFiles] = useState<GeneratedFile[]>([]);
  const [status, setStatus] = useState("Bestanden laden...");
  const [setupRequired, setSetupRequired] = useState(false);

  const loadFiles = useCallback(async () => {
    setStatus("Bestanden laden...");
    const response = await authFetch("/api/exports");
    const payload = await response.json();
    setFiles(payload.files ?? []);
    setSetupRequired(Boolean(payload.setupRequired));
    setStatus(response.ok ? "Bestanden geladen." : payload.error || "Bestanden konden niet worden geladen.");
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadFiles();
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [loadFiles]);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-neutral-700">Bestanden</p>
          <h1 className="mt-2 text-4xl font-semibold text-neutral-950">Alles wat LifePilot voor je maakt.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600">
            Exports uit de assistent verschijnen hier zodra ze zijn aangemaakt.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href="/assistant">Nieuw bestand maken</Link>
          </Button>
          <Button onClick={loadFiles} type="button" variant="secondary">
            <RefreshCw aria-hidden className="h-4 w-4" />
            Verversen
          </Button>
        </div>
      </div>

      {setupRequired ? (
        <div className="rounded-lg border border-neutral-200 bg-white p-4 text-sm leading-6 text-neutral-600 shadow-sm">
          De bestanden-database of opslagbucket is nog niet ingericht. De exportfunctie blijft beschikbaar; zodra
          Supabase Storage en `generated_files` klaarstaan, zie je downloads hier terug.
        </div>
      ) : null}

      <div className="rounded-lg border border-neutral-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-neutral-100 text-neutral-950">
              <Sparkles aria-hidden className="h-4 w-4" />
            </span>
            <h2 className="text-sm font-semibold text-neutral-950">Recente exports</h2>
          </div>
          <span className="text-xs font-semibold text-neutral-500">{files.length} bestanden</span>
        </div>

        <div className="divide-y divide-neutral-100">
          {files.map((file) => {
            const Icon = fileIcon(file.file_type);
            return (
              <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between" key={file.id}>
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-neutral-100 text-neutral-950">
                    <Icon aria-hidden className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-neutral-950">{file.title}</p>
                    <p className="text-xs font-medium text-neutral-500">
                      {file.file_type.toUpperCase()} {file.created_at ? `· ${new Date(file.created_at).toLocaleDateString("nl-NL")}` : ""}
                    </p>
                  </div>
                </div>
                {file.download_url ? (
                  <Button asChild variant="secondary">
                    <a href={file.download_url}>
                      <ArrowDownToLine aria-hidden className="h-4 w-4" />
                      Download
                    </a>
                  </Button>
                ) : null}
              </div>
            );
          })}

          {!files.length ? (
            <div className="px-5 py-12 text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-lg bg-neutral-100 text-neutral-950">
                <FileArchive aria-hidden className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-neutral-950">Nog geen exports</h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-600">
                Vraag de assistent om een PDF, Word-document, Excel-sheet of CSV te maken. Je download staat daarna hier.
              </p>
              <Button asChild className="mt-5">
                <Link href="/assistant?prompt=Maak een PDF-overzicht van mijn planning.">Maak eerste bestand</Link>
              </Button>
            </div>
          ) : null}
        </div>
      </div>
      <p aria-live="polite" className="text-sm text-neutral-500">{status}</p>
    </section>
  );
}
