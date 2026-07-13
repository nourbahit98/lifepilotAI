# LifePilot AI

LifePilot AI is een Next.js SaaS-webapp voor planning, documentanalyse, teksthulp, budgetten, boodschappen, bestandsvergelijking en exports naar PDF, Word, Excel en CSV.

## Lokaal installeren

```bash
npm install
cp .env.example .env.local
npm run dev
```

Vul daarna `.env.local` met Supabase-, OpenAI- en Stripe-waarden.

## Omgevingsvariabelen

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_PREMIUM_MONTHLY=
STRIPE_PRICE_PREMIUM_YEARLY=
STRIPE_PRICE_PREMIUM_PLUS_MONTHLY=
STRIPE_PRICE_PREMIUM_PLUS_YEARLY=
NEXT_PUBLIC_APP_URL=
```

## Supabase instellen

1. Maak een Supabase-project.
2. Zet de URL, anon key en service role key in `.env.local`.
3. Voer `supabase/migrations/0001_lifepilot_core.sql` uit via de Supabase SQL Editor of via de Supabase CLI.
4. Controleer dat de private Storage buckets `documents` en `generated-files` bestaan.
5. Controleer RLS-policies voor alle tabellen in de Supabase Table Editor.
6. Maak testaccounts aan via Supabase Auth:
   - gratis gebruiker;
   - Premium-gebruiker;
   - Premium Plus-gebruiker;
   - admin.
7. Zet voor admin het veld `profiles.role` op `admin`.

De migratie maakt tabellen, indexes, RLS-policies, storage policies en een registratie-trigger die automatisch een profiel en gratis abonnement aanmaakt.

## Stripe instellen

1. Maak Stripe-producten voor Premium en Premium Plus.
2. Maak maandelijkse en jaarlijkse prijzen.
3. Vul de vier Stripe price IDs in `.env.local`.
4. Configureer een webhook naar:

```text
https://jouw-domein.nl/api/stripe/webhook
```

Gebruik deze events:

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.paid`
- `invoice.payment_failed`

Zet `STRIPE_WEBHOOK_SECRET` met de webhook signing secret.

## OpenAI instellen

Vul `OPENAI_API_KEY` in. LifePilot gebruikt server-side routes voor AI-routing en resultaatgeneratie. De API-key wordt nooit naar browsercode gestuurd.

## Belangrijke routes

- `/` homepage
- `/functies`
- `/prijzen`
- `/privacybeleid`
- `/algemene-voorwaarden`
- `/inloggen`
- `/registreren`
- `/dashboard`
- `/assistant`
- `/planning`
- `/documenten`
- `/bestanden`
- `/abonnement`
- `/profiel`
- `/privacy-en-gegevens`
- `/instellingen`
- `/admin`

## Serverroutes

- `POST /api/ai` streamt statusupdates en AI-resultaten.
- `GET/POST /api/documents` beheert uploads en tekstextractie.
- `GET/POST /api/exports` beheert en genereert echte PDF-, DOCX-, XLSX- en CSV-bestanden.
- `GET/PATCH/DELETE /api/conversations` beheert gesprekken.
- `GET/POST/DELETE /api/planning` beheert planningitems.
- `POST /api/stripe/checkout` start Stripe Checkout.
- `POST /api/stripe/portal` opent het Stripe Customer Portal.
- `POST /api/stripe/webhook` verwerkt Stripe-events.
- `GET /api/privacy/export` exporteert gebruikersdata.
- `POST /api/privacy/delete-account` verwijdert het account.

## Testen

```bash
npm run lint
npm test
npm run build
```

De tests controleren onder andere AI-routing en echte exportgeneratie.

## Deployment naar Vercel

1. Koppel de GitHub-repository aan Vercel.
2. Zet alle omgevingsvariabelen in Vercel Project Settings.
3. Gebruik de standaard build command:

```bash
npm run build
```

4. Zet de Stripe webhook op je Vercel-productiedomein.
5. Voeg het productiedomein toe aan Supabase Auth redirect URLs.

## Beveiliging

- Supabase RLS is verplicht voor alle gebruikersdata.
- Service role wordt alleen server-side gebruikt.
- API-routes valideren sessies via Supabase Auth.
- Uploads worden gevalideerd op type, grootte en bestandsnaam.
- Documentinhoud wordt in prompts als onvertrouwde inhoud behandeld.
- Gebruiksbeperkingen worden server-side gecontroleerd.
- Adminroutes controleren `profiles.role = admin`.

## Externe koppelingen

Zonder geldige Supabase-, OpenAI- en Stripe-sleutels toont de app configuratiemeldingen. De integraties zijn aanwezig; vul de omgevingsvariabelen in om ze te activeren.
