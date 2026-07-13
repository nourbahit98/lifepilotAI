"use client";

import { useSearchParams } from "next/navigation";
import { FormEvent, useMemo, useRef, useState } from "react";

import { authFetch } from "@/components/app/client-api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { examplePrompts } from "@/lib/modules";
import { AIRouterResult, AssistantResult } from "@/lib/types";

export function AssistantWorkspace() {
  const searchParams = useSearchParams();
  const [prompt, setPrompt] = useState(searchParams.get("prompt") || examplePrompts[1]);
  const [status, setStatus] = useState("Klaar voor je opdracht.");
  const [result, setResult] = useState<AssistantResult | null>(null);
  const [router, setRouter] = useState<AIRouterResult | null>(null);
  const [documents, setDocuments] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const canExport = useMemo(() => Boolean(result?.full_result), [result]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setResult(null);
    setStatus("Opdracht analyseren");
    try {
      const response = await authFetch("/api/ai", {
        body: JSON.stringify({ documents, prompt }),
        method: "POST",
      });
      if (!response.body) throw new Error("AI-service is tijdelijk niet bereikbaar.");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop() ?? "";
        for (const eventChunk of events) {
          const eventName = eventChunk.match(/^event: (.+)$/m)?.[1];
          const dataText = eventChunk.match(/^data: (.+)$/m)?.[1];
          if (!dataText) continue;
          const data = JSON.parse(dataText);
          if (eventName === "status") setStatus(data);
          if (eventName === "router") setRouter(data);
          if (eventName === "error") setStatus(data);
          if (eventName === "result") {
            setResult(data.result);
            setRouter(data.router);
            setStatus("Resultaat klaar voor gebruik.");
          }
        }
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "AI-service is tijdelijk niet bereikbaar.");
    } finally {
      setLoading(false);
    }
  }

  async function uploadFiles(files: FileList | null) {
    if (!files?.length) return;
    setStatus("Document uitlezen");
    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append("files", file));
    const response = await authFetch("/api/documents", { body: formData, method: "POST" });
    const payload = await response.json();
    if (!response.ok) {
      setStatus(payload.error || "Document kon niet worden geüpload.");
      return;
    }
    const extracted = payload.documents
      .map((doc: { extracted_text?: string; filename: string }) =>
        doc.extracted_text ? `Bestand: ${doc.filename}\n${doc.extracted_text}` : "",
      )
      .filter(Boolean);
    setDocuments((current) => [...current, ...extracted]);
    setStatus(`${payload.documents.length} document(en) toegevoegd.`);
  }

  async function exportResult(type: "pdf" | "docx" | "xlsx" | "csv") {
    if (!result) return;
    const response = await authFetch("/api/exports", {
      body: JSON.stringify({ content: result.full_result, title: result.title, type }),
      method: "POST",
    });
    if (!response.ok) {
      const payload = await response.json();
      setStatus(payload.error || "Export kon niet worden gegenereerd.");
      return;
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${result.title}.${type}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setStatus(`${type.toUpperCase()} gedownload.`);
  }

  async function copyResult() {
    if (!result) return;
    await navigator.clipboard.writeText(result.full_result);
    setStatus("Resultaat gekopieerd.");
  }

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm font-medium text-neutral-700">AI-assistent</p>
        <h1 className="mt-2 text-4xl font-semibold text-neutral-950">Vraag LifePilot om iets te regelen.</h1>
      </section>
      <Card>
        <CardContent>
          <form className="space-y-4" onSubmit={submit}>
            <Textarea onChange={(event) => setPrompt(event.target.value)} value={prompt} />
            <input
              className="sr-only"
              multiple
              onChange={(event) => uploadFiles(event.target.files)}
              ref={fileRef}
              type="file"
            />
            <div className="flex flex-wrap gap-2">
              <Button disabled={loading} type="submit">
                {loading ? "Bezig..." : "Regel dit"}
              </Button>
              <Button onClick={() => fileRef.current?.click()} type="button" variant="secondary">
                Upload bestanden
              </Button>
              <Button onClick={() => setPrompt(prompt)} type="button" variant="secondary">
                Opdracht herhalen
              </Button>
            </div>
          </form>
          <div className="mt-5 flex flex-wrap gap-2">
            {examplePrompts.map((example) => (
              <button
                className="rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-semibold text-neutral-600 hover:bg-neutral-200"
                key={example}
                onClick={() => setPrompt(example)}
                type="button"
              >
                {example}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-neutral-950">Resultaat</h2>
            <p aria-live="polite" className="mt-1 text-sm text-neutral-600">{status}</p>
          </div>
          {router ? (
            <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-700">
              {router.intent} · {router.output_type}
            </span>
          ) : null}
        </CardHeader>
        <CardContent>
          {result ? (
            <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="space-y-4">
                <Block title="Korte conclusie" lines={[result.summary]} />
                <Block title="Belangrijkste informatie" lines={result.important_information} />
                <Block title="Aanbevolen acties" lines={result.recommended_actions} />
                {result.warning ? <Block title="Waarschuwing" lines={[result.warning]} warning /> : null}
              </div>
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-5">
                <h3 className="text-sm font-semibold text-neutral-950">{result.title}</h3>
                <textarea
                  className="mt-4 min-h-80 w-full resize-y rounded-lg border border-neutral-200 bg-white p-4 text-sm leading-7 text-neutral-700"
                  onChange={(event) =>
                    setResult((current) => current && { ...current, full_result: event.target.value })
                  }
                  value={result.full_result}
                />
              </div>
            </div>
          ) : (
            <p className="text-sm leading-6 text-neutral-600">
              Je resultaat verschijnt hier met een samenvatting, acties, volledig antwoord en exportknoppen.
            </p>
          )}
          <div className="mt-5 flex flex-wrap gap-2 border-t border-neutral-100 pt-5">
            <Button disabled={!canExport} onClick={copyResult} type="button" variant="secondary">Kopiëren</Button>
            <Button disabled={!canExport} onClick={() => exportResult("pdf")} type="button" variant="secondary">PDF</Button>
            <Button disabled={!canExport} onClick={() => exportResult("docx")} type="button" variant="secondary">Word</Button>
            <Button disabled={!canExport} onClick={() => exportResult("xlsx")} type="button" variant="secondary">Excel</Button>
            <Button disabled={!canExport} onClick={() => exportResult("csv")} type="button" variant="secondary">CSV</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Block({ lines, title, warning }: { lines: string[]; title: string; warning?: boolean }) {
  return (
    <section className={warning ? "rounded-lg bg-neutral-50 p-4" : "rounded-lg bg-neutral-50 p-4"}>
      <h3 className="text-sm font-semibold text-neutral-950">{title}</h3>
      <ul className="mt-2 space-y-1">
        {lines.map((line) => (
          <li className="text-sm leading-6 text-neutral-600" key={line}>{line}</li>
        ))}
      </ul>
    </section>
  );
}
