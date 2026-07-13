"use client";

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
      <div>
        <p className="text-sm font-medium text-green-700">Privacy en gegevens</p>
        <h1 className="mt-2 text-4xl font-semibold text-neutral-950">Jij bepaalt wat LifePilot onthoudt.</h1>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardContent>
            <h2 className="text-base font-semibold text-neutral-950">Gegevens beheren</h2>
            <p className="mt-3 text-sm leading-6 text-neutral-600">
              Exporteer alle opgeslagen gesprekken, documenten, planning, bestanden, geheugenitems en gebruiksrecords.
            </p>
            <Button className="mt-5" onClick={exportData} type="button">Exporteer mijn gegevens</Button>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <h2 className="text-base font-semibold text-neutral-950">Automatische documentverwijdering</h2>
            <select className="mt-4 h-11 w-full rounded-lg border border-neutral-200 px-4 text-sm">
              <option>Direct na verwerking</option>
              <option>Na 24 uur</option>
              <option>Na 7 dagen</option>
              <option>Nooit automatisch</option>
            </select>
          </CardContent>
        </Card>
      </div>
      <Card className="border-red-200">
        <CardContent>
          <h2 className="text-base font-semibold text-red-950">Account verwijderen</h2>
          <p className="mt-3 text-sm leading-6 text-red-800">
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
