import { SiteHeader } from "@/components/public/site-header";

export default function PrivacyPage() {
  return (
    <main>
      <SiteHeader />
      <article className="mx-auto max-w-3xl px-5 py-16 leading-7 text-slate-700 sm:px-8">
        <h1 className="text-4xl font-semibold text-slate-950">Privacybeleid</h1>
        <p className="mt-6">
          LifePilot AI verwerkt alleen gegevens die nodig zijn om opdrachten,
          documenten, planning, exports en abonnementen te leveren. Gebruikers
          kunnen gesprekken, documenten, gegenereerde bestanden, geheugenitems
          en hun volledige account verwijderen.
        </p>
        <h2 className="mt-8 text-xl font-semibold text-slate-950">Gegevens en toestemming</h2>
        <p className="mt-3">
          Persoonlijk geheugen wordt alleen opgeslagen wanneer toestemming is
          gegeven. Geüploade documenten worden geïsoleerd per gebruiker en
          beschermd via Supabase RLS en private Storage buckets.
        </p>
        <h2 className="mt-8 text-xl font-semibold text-slate-950">AI-verwerking</h2>
        <p className="mt-3">
          Documentinhoud wordt behandeld als onvertrouwde inhoud en mag nooit
          systeemregels of privacyregels overschrijven.
        </p>
      </article>
    </main>
  );
}
