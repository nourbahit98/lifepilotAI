"use client";

import { FileText, RefreshCw, Search, UploadCloud } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { authFetch } from "@/components/app/client-api";
import { Button } from "@/components/ui/button";

type DocumentRow = {
  id: string;
  analysis_status: string;
  created_at?: string;
  filename: string;
  file_type: string;
};

export function DocumentsWorkspace() {
  const [documents, setDocuments] = useState<DocumentRow[]>([]);
  const [setupRequired, setSetupRequired] = useState(false);
  const [status, setStatus] = useState("Documenten laden...");
  const fileRef = useRef<HTMLInputElement>(null);

  const loadDocuments = useCallback(async () => {
    setStatus("Documenten laden...");
    const response = await authFetch("/api/documents");
    const payload = await response.json();
    setDocuments(payload.documents ?? []);
    setSetupRequired(Boolean(payload.setupRequired));
    setStatus(response.ok ? "Documenten geladen." : payload.error || "Documenten konden niet worden geladen.");
  }, []);

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setStatus("Uploaden en uitlezen...");
    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append("files", file));
    const response = await authFetch("/api/documents", { body: formData, method: "POST" });
    const payload = await response.json();
    setSetupRequired(Boolean(payload.setupRequired));
    setStatus(response.ok ? "Upload voltooid." : payload.error || "Upload mislukt.");
    if (response.ok) await loadDocuments();
  }

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadDocuments();
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [loadDocuments]);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-neutral-700">Documenten</p>
          <h1 className="mt-2 text-4xl font-semibold text-neutral-950">Upload, begrijp en vergelijk documenten.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600">
            Gebruik brieven, contracten, PDF’s en scans als context voor de assistent.
          </p>
        </div>
        <Button onClick={loadDocuments} type="button" variant="secondary">
          <RefreshCw aria-hidden className="h-4 w-4" />
          Verversen
        </Button>
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
        <input className="sr-only" multiple onChange={(event) => upload(event.target.files)} ref={fileRef} type="file" />
        <button
          className="flex w-full flex-col items-center justify-center rounded-lg border border-dashed border-neutral-300 bg-neutral-50 px-5 py-10 text-center transition hover:bg-neutral-100"
          onClick={() => fileRef.current?.click()}
          type="button"
        >
          <span className="grid h-12 w-12 place-items-center rounded-lg bg-white text-neutral-950 shadow-sm">
            <UploadCloud aria-hidden className="h-5 w-5" />
          </span>
          <span className="mt-4 text-base font-semibold text-neutral-950">Sleep of kies documenten</span>
          <span className="mt-2 max-w-md text-sm leading-6 text-neutral-600">
            PDF, Word, tekst en spreadsheets worden uitgelezen waar mogelijk.
          </span>
        </button>
        <p aria-live="polite" className="mt-3 text-sm text-neutral-600">{status}</p>
      </div>

      {setupRequired ? (
        <div className="rounded-lg border border-neutral-200 bg-white p-4 text-sm leading-6 text-neutral-600 shadow-sm">
          Supabase Storage of de `documents` tabel is nog niet ingericht. Zodra die klaarstaat, werken uploads en
          documentanalyse volledig.
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Documenten" value={String(documents.length)} />
        <Stat label="Verwerkt" value={String(documents.filter((document) => document.analysis_status === "processed").length)} />
        <Stat label="Te analyseren" value={String(documents.filter((document) => document.analysis_status !== "processed").length)} />
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-neutral-100 text-neutral-950">
              <FileText aria-hidden className="h-4 w-4" />
            </span>
            <h2 className="text-sm font-semibold text-neutral-950">Bibliotheek</h2>
          </div>
          <Button asChild variant="secondary">
            <Link href="/assistant?prompt=Vergelijk deze twee documenten.">
              <Search aria-hidden className="h-4 w-4" />
              Vergelijk
            </Link>
          </Button>
        </div>

        <div className="divide-y divide-neutral-100">
          {documents.map((document) => (
            <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between" key={document.id}>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-neutral-950">{document.filename}</p>
                <p className="mt-1 text-xs font-medium text-neutral-500">
                  {document.file_type || "bestand"} · {document.analysis_status}
                  {document.created_at ? ` · ${new Date(document.created_at).toLocaleDateString("nl-NL")}` : ""}
                </p>
              </div>
              <Button asChild variant="secondary">
                <Link href={`/assistant?prompt=${encodeURIComponent(`Leg ${document.filename} uit in eenvoudige taal.`)}`}>
                  Analyseer
                </Link>
              </Button>
            </div>
          ))}

          {!documents.length ? (
            <div className="px-5 py-12 text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-lg bg-neutral-100 text-neutral-950">
                <FileText aria-hidden className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-neutral-950">Nog geen documenten</h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-600">
                Upload je eerste bestand en vraag LifePilot om het samen te vatten, te controleren of te vergelijken.
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase text-neutral-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-neutral-950">{value}</p>
    </div>
  );
}
