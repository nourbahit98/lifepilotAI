"use client";

import { useEffect, useRef, useState } from "react";

import { authFetch } from "@/components/app/client-api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

type DocumentRow = {
  id: string;
  analysis_status: string;
  created_at: string;
  filename: string;
  file_type: string;
};

export function DocumentsWorkspace() {
  const [documents, setDocuments] = useState<DocumentRow[]>([]);
  const [status, setStatus] = useState("Documenten laden...");
  const fileRef = useRef<HTMLInputElement>(null);

  async function loadDocuments() {
    const response = await authFetch("/api/documents");
    const payload = await response.json();
    if (response.ok) {
      setDocuments(payload.documents);
      setStatus("Documenten geladen.");
    } else {
      setStatus(payload.error || "Documenten konden niet worden geladen.");
    }
  }

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setStatus("Uploaden en uitlezen...");
    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append("files", file));
    const response = await authFetch("/api/documents", { body: formData, method: "POST" });
    const payload = await response.json();
    setStatus(response.ok ? "Upload voltooid." : payload.error);
    await loadDocuments();
  }

  useEffect(() => {
    void (async () => {
      await loadDocuments();
    })();
  }, []);

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-medium text-green-700">Documenten</p>
        <h1 className="mt-2 text-4xl font-semibold text-neutral-950">Upload, analyseer en beheer documenten.</h1>
      </div>
      <Card>
        <CardContent>
          <input className="sr-only" multiple onChange={(event) => upload(event.target.files)} ref={fileRef} type="file" />
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={() => fileRef.current?.click()} type="button">Bestanden uploaden</Button>
            <p aria-live="polite" className="text-sm text-neutral-600">{status}</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <h2 className="text-base font-semibold text-neutral-950">Recente documenten</h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {documents.map((document) => (
              <div className="flex flex-col gap-2 rounded-lg bg-neutral-50 p-4 sm:flex-row sm:items-center sm:justify-between" key={document.id}>
                <div>
                  <p className="font-semibold text-neutral-950">{document.filename}</p>
                  <p className="text-sm text-neutral-600">{document.file_type} · {document.analysis_status}</p>
                </div>
                <Button asChild variant="secondary">
                  <a href={`/assistant?prompt=${encodeURIComponent(`Leg ${document.filename} uit in eenvoudige taal.`)}`}>Analyseer</a>
                </Button>
              </div>
            ))}
            {!documents.length ? <p className="text-sm text-neutral-600">Nog geen documenten.</p> : null}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
