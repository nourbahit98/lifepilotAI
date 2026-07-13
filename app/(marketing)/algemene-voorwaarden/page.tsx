import { SiteHeader } from "@/components/public/site-header";

export default function TermsPage() {
  return (
    <main>
      <SiteHeader />
      <article className="mx-auto max-w-3xl px-5 py-16 leading-7 text-slate-700 sm:px-8">
        <h1 className="text-4xl font-semibold text-slate-950">Algemene voorwaarden</h1>
        <p className="mt-6">
          LifePilot AI helpt met planning, documenten, teksten, vergelijkingen,
          budgetten en bestanden. De dienst vervangt geen professioneel juridisch,
          medisch of financieel advies.
        </p>
        <h2 className="mt-8 text-xl font-semibold text-slate-950">Abonnementen</h2>
        <p className="mt-3">
          Abonnementen worden via Stripe verwerkt en kunnen via het Customer
          Portal worden beheerd, geüpgraded, gedowngraded of opgezegd.
        </p>
        <h2 className="mt-8 text-xl font-semibold text-slate-950">Gebruik</h2>
        <p className="mt-3">
          Gebruikers blijven verantwoordelijk voor het controleren van datums,
          bedragen, ontvangers en definitieve beslissingen voordat resultaten
          worden verzonden of gebruikt.
        </p>
      </article>
    </main>
  );
}
