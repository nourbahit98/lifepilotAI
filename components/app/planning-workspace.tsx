"use client";

import { CalendarDays, CheckCircle2, Circle, Clock3, RefreshCw, Sparkles } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { authFetch } from "@/components/app/client-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type PlanningItem = {
  id: string;
  priority: "low" | "normal" | "high";
  status: "todo" | "in_progress" | "done" | "moved";
  title: string;
};

const localKey = "lifepilot-local-planning";

const columns = [
  { icon: Circle, label: "Te doen", status: "todo" as const },
  { icon: Clock3, label: "Bezig", status: "in_progress" as const },
  { icon: CheckCircle2, label: "Klaar", status: "done" as const },
];

const suggestions = [
  "Morgen om 09:00 belastingpapieren verzamelen",
  "Vrijdag klantmail afronden",
  "Deze week drie sportmomenten plannen",
];

function readLocalItems() {
  try {
    return JSON.parse(window.localStorage.getItem(localKey) || "[]") as PlanningItem[];
  } catch {
    return [];
  }
}

function persistLocalItems(nextItems: PlanningItem[]) {
  window.localStorage.setItem(localKey, JSON.stringify(nextItems));
}

export function PlanningWorkspace() {
  const [items, setItems] = useState<PlanningItem[]>([]);
  const [localMode, setLocalMode] = useState(false);
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("Planning laden...");

  const load = useCallback(async () => {
    setStatus("Planning laden...");
    const response = await authFetch("/api/planning");
    const payload = await response.json();

    if (response.ok && !payload.setupRequired) {
      setItems(payload.items ?? []);
      setLocalMode(false);
      setStatus("Planning geladen.");
      return;
    }

    const localItems = readLocalItems();
    setItems(localItems);
    setLocalMode(true);
    setStatus(payload.error || "Planning draait lokaal totdat Supabase is ingericht.");
  }, []);

  function addLocalItem(nextTitle: string) {
    const nextItems = [
      {
        id: crypto.randomUUID(),
        priority: "normal" as const,
        status: "todo" as const,
        title: nextTitle,
      },
      ...items,
    ];
    setItems(nextItems);
    persistLocalItems(nextItems);
    setStatus("Taak lokaal toegevoegd.");
  }

  async function saveItem(nextTitle = title) {
    const cleanTitle = nextTitle.trim();
    if (!cleanTitle) return;

    if (localMode) {
      addLocalItem(cleanTitle);
      setTitle("");
      return;
    }

    const response = await authFetch("/api/planning", {
      body: JSON.stringify({ priority: "normal", status: "todo", title: cleanTitle }),
      method: "POST",
    });
    const payload = await response.json();

    if (payload.setupRequired) {
      setLocalMode(true);
      addLocalItem(cleanTitle);
    } else if (response.ok) {
      setStatus("Planning opgeslagen.");
      await load();
    } else {
      setStatus(payload.error || "Planning kon niet worden opgeslagen.");
    }
    setTitle("");
  }

  async function updateItemStatus(item: PlanningItem, nextStatus: PlanningItem["status"]) {
    const nextItems = items.map((current) =>
      current.id === item.id ? { ...current, status: nextStatus } : current,
    );
    setItems(nextItems);

    if (localMode) {
      persistLocalItems(nextItems);
      setStatus("Planning lokaal bijgewerkt.");
      return;
    }

    const response = await authFetch("/api/planning", {
      body: JSON.stringify({ ...item, status: nextStatus }),
      method: "POST",
    });
    const payload = await response.json();
    if (!response.ok || payload.setupRequired) {
      setLocalMode(true);
      persistLocalItems(nextItems);
      setStatus(payload.error || "Planning lokaal bijgewerkt.");
    } else {
      setStatus("Planning bijgewerkt.");
    }
  }

  async function removeItem(item: PlanningItem) {
    const nextItems = items.filter((current) => current.id !== item.id);
    setItems(nextItems);

    if (localMode) {
      persistLocalItems(nextItems);
      setStatus("Taak lokaal verwijderd.");
      return;
    }

    const response = await authFetch(`/api/planning?id=${encodeURIComponent(item.id)}`, { method: "DELETE" });
    const payload = await response.json();
    if (!response.ok || payload.setupRequired) {
      setLocalMode(true);
      persistLocalItems(nextItems);
      setStatus(payload.error || "Taak lokaal verwijderd.");
    } else {
      setStatus("Taak verwijderd.");
    }
  }

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [load]);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-neutral-700">Planning</p>
          <h1 className="mt-2 text-4xl font-semibold text-neutral-950">Plan zoals je met een AI zou praten.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600">
            Voeg taken toe, schuif ze door en houd je dag compact. {localMode ? "Lokale modus is actief." : ""}
          </p>
        </div>
        <Button onClick={load} type="button" variant="secondary">
          <RefreshCw aria-hidden className="h-4 w-4" />
          Verversen
        </Button>
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input
            onChange={(event) => setTitle(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") void saveItem();
            }}
            placeholder="Nieuwe taak, deadline of herinnering"
            value={title}
          />
          <Button onClick={() => saveItem()} type="button">Toevoegen</Button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {suggestions.map((suggestion) => (
            <button
              className="rounded-full bg-[#151515] px-3 py-1.5 text-xs font-semibold text-white hover:bg-black"
              key={suggestion}
              onClick={() => saveItem(suggestion)}
              type="button"
            >
              {suggestion}
            </button>
          ))}
        </div>
        <p aria-live="polite" className="mt-3 text-sm text-neutral-600">{status}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {columns.map(({ icon: Icon, label, status: columnStatus }) => {
          const columnItems = items.filter((item) => item.status === columnStatus);
          return (
            <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm" key={columnStatus}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-neutral-100 text-neutral-950">
                    <Icon aria-hidden className="h-4 w-4" />
                  </span>
                  <h2 className="text-sm font-semibold text-neutral-950">{label}</h2>
                </div>
                <span className="text-xs font-semibold text-neutral-500">{columnItems.length}</span>
              </div>

              <div className="mt-4 space-y-2">
                {columnItems.map((item) => (
                  <div className="rounded-lg bg-neutral-50 p-3" key={item.id}>
                    <p className="text-sm font-semibold text-neutral-950">{item.title}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {columnStatus !== "todo" ? (
                        <button
                          className="rounded-full bg-[#151515] px-3 py-1 text-xs font-semibold text-white"
                          onClick={() => updateItemStatus(item, "todo")}
                          type="button"
                        >
                          Te doen
                        </button>
                      ) : null}
                      {columnStatus !== "in_progress" ? (
                        <button
                          className="rounded-full bg-[#151515] px-3 py-1 text-xs font-semibold text-white"
                          onClick={() => updateItemStatus(item, "in_progress")}
                          type="button"
                        >
                          Bezig
                        </button>
                      ) : null}
                      {columnStatus !== "done" ? (
                        <button
                          className="rounded-full bg-[#151515] px-3 py-1 text-xs font-semibold text-white"
                          onClick={() => updateItemStatus(item, "done")}
                          type="button"
                        >
                          Klaar
                        </button>
                      ) : null}
                      <button
                        className="rounded-full bg-[#151515] px-3 py-1 text-xs font-semibold text-white"
                        onClick={() => removeItem(item)}
                        type="button"
                      >
                        Verwijder
                      </button>
                    </div>
                  </div>
                ))}

                {!columnItems.length ? (
                  <div className="rounded-lg border border-dashed border-neutral-200 p-6 text-center">
                    <CalendarDays aria-hidden className="mx-auto h-5 w-5 text-neutral-400" />
                    <p className="mt-3 text-sm text-neutral-500">Geen taken.</p>
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <Sparkles aria-hidden className="h-4 w-4 text-neutral-950" />
          <h2 className="text-sm font-semibold text-neutral-950">AI-tip</h2>
        </div>
        <p className="mt-2 text-sm leading-6 text-neutral-600">
          Vraag de assistent om je planning opnieuw te verdelen als je taken blijven liggen.
        </p>
      </div>
    </section>
  );
}
