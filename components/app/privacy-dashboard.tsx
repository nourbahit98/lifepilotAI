"use client";

import { Download, FileClock, ShieldCheck, Trash2 } from "lucide-react";
import { useState } from "react";

import { authFetch } from "@/components/app/client-api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function PrivacyDashboard() {
  const [status, setStatus] = useState("");
  const [confirmation, setConfirmation] = useState("");

  async function exportData() {
    const response = await authFetch("/api/privacy/export");
    const payload = await response.json();
    if (!response.ok) {
      setStatus(payload.error || "Export kon niet worden gemaakt.");
      return;
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "lifepilot-data-export.json";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setStatus("Gegevens geëxporteerd.");
  }

  async function deleteAccount() {
    const response = await authFetch("/api/privacy/delete-account", {
      body: JSON.stringify({ confirmation }),
      method: "POST",
    });
    const payload = await response.json();
    setStatus(response.ok ? "Account verwijderd." : payload.error);
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-neutral-700">Privacy en gegevens</p>
          <h1 className="mt-2 text-4xl font-semibold text-neutral-950">Jij bepaalt wat LifePilot onthoudt.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600">
            Exporteer, minimaliseer of verwijder je data vanuit één controlepaneel.
          </p>
        </div>
        <Button onClick={exportData} type="button">
          <Download aria-hidden className="h-4 w-4" />
          Exporteer data
        </Button>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardContent>
            <div className="flex items-center gap-2">
              <ShieldCheck aria-hidden className="h-4 w-4 text-neutral-950" />
              <h2 className="text-base font-semibold text-neutral-950">Gegevens beheren</h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-neutral-600">
              Exporteer alle opgeslagen gesprekken, documenten, planning, bestanden, geheugenitems en gebruiksrecords.
            </p>
            <Button className="mt-5" onClick={exportData} type="button" variant="secondary">
              JSON-export downloaden
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="flex items-center gap-2">
              <FileClock aria-hidden className="h-4 w-4 text-neutral-950" />
              <h2 className="text-base font-semibold text-neutral-950">Automatische documentverwijdering</h2>
            </div>
            <select className="mt-4 h-11 w-full rounded-lg border border-neutral-200 px-4 text-sm">
              <option>Direct na verwerking</option>
              <option>Na 24 uur</option>
              <option>Na 7 dagen</option>
              <option>Nooit automatisch</option>
            </select>
          </CardContent>
        </Card>
      </div>
      <Card className="border-neutral-200">
        <CardContent>
          <div className="flex items-center gap-2">
            <Trash2 aria-hidden className="h-4 w-4 text-neutral-950" />
            <h2 className="text-base font-semibold text-neutral-950">Account verwijderen</h2>
          </div>
          <p className="mt-3 text-sm leading-6 text-neutral-700">
            Typ VERWIJDER MIJN ACCOUNT om je account en gekoppelde data te verwijderen.
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Input onChange={(event) => setConfirmation(event.target.value)} value={confirmation} />
            <Button onClick={deleteAccount} type="button" variant="danger">Verwijderen</Button>
          </div>
          {status ? <p className="mt-3 text-sm text-neutral-600">{status}</p> : null}
        </CardContent>
      </Card>
    </section>
  );
}
