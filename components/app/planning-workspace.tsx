"use client";

import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useEffect, useState } from "react";

import { authFetch } from "@/components/app/client-api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type PlanningItem = {
  id: string;
  priority: "low" | "normal" | "high";
  status: "todo" | "in_progress" | "done" | "moved";
  title: string;
};

export function PlanningWorkspace() {
  const [items, setItems] = useState<PlanningItem[]>([]);
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("Planning laden...");

  async function load() {
    const response = await authFetch("/api/planning");
    const payload = await response.json();
    if (response.ok) {
      setItems(payload.items);
      setStatus("Planning geladen.");
    } else {
      setStatus(payload.error || "Planning kon niet worden geladen.");
    }
  }

  async function saveItem(nextTitle = title) {
    if (!nextTitle.trim()) return;
    const response = await authFetch("/api/planning", {
      body: JSON.stringify({ priority: "normal", status: "todo", title: nextTitle }),
      method: "POST",
    });
    const payload = await response.json();
    setStatus(response.ok ? "Planning opgeslagen." : payload.error);
    setTitle("");
    await load();
  }

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);
    setItems(arrayMove(items, oldIndex, newIndex));
    setStatus("Volgorde lokaal bijgewerkt.");
  }

  useEffect(() => {
    void (async () => {
      await load();
    })();
  }, []);

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-medium text-green-700">Planning</p>
        <h1 className="mt-2 text-4xl font-semibold text-neutral-950">Dag-, week- en lijstweergave.</h1>
      </div>
      <Card>
        <CardContent>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input onChange={(event) => setTitle(event.target.value)} placeholder="Nieuwe taak of deadline" value={title} />
            <Button onClick={() => saveItem()} type="button">Toevoegen</Button>
            <Button onClick={() => saveItem("Planning opnieuw optimaliseren")} type="button" variant="secondary">
              Planning opnieuw optimaliseren
            </Button>
          </div>
          <p aria-live="polite" className="mt-3 text-sm text-neutral-600">{status}</p>
        </CardContent>
      </Card>
      <div className="grid gap-5 lg:grid-cols-3">
        {["Dag", "Week", "Lijst"].map((view) => (
          <Card key={view}>
            <CardContent>
              <h2 className="text-base font-semibold text-neutral-950">{view}weergave</h2>
              <DndContext onDragEnd={onDragEnd}>
                <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
                  <ul className="mt-4 space-y-3">
                    {items.map((item) => <SortablePlanningItem item={item} key={item.id} />)}
                  </ul>
                </SortableContext>
              </DndContext>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

function SortablePlanningItem({ item }: { item: PlanningItem }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: item.id,
  });
  return (
    <li
      className="cursor-grab rounded-lg bg-neutral-50 p-3 text-sm text-neutral-700 active:cursor-grabbing"
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
    >
      {item.title}
    </li>
  );
}
