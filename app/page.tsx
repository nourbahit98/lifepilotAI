"use client";

import { FormEvent, useRef, useState } from "react";

type ResultKey = "letter" | "week" | "email" | "budget" | "compare";

type Result = {
  key: ResultKey;
  label: string;
  prompt: string;
  conclusion: string;
  details: string[];
  actions: string[];
  full: string;
  deadline?: string;
  calendarDate: string;
  fileName: string;
};

const results: Record<ResultKey, Result> = {
  letter: {
    key: "letter",
    label: "Leg deze brief uit",
    prompt:
      "Lees deze brief, vertel mij wat ik moet doen en schrijf een reactie.",
    conclusion:
      "De brief vraagt om een reactie op een voorgestelde huurverhoging.",
    details: [
      "De verhuurder noemt een verhoging vanaf augustus.",
      "De berekening ontbreekt, dus vraag om onderbouwing.",
      "Bewaar de brief en je reactie samen in Documenten.",
    ],
    actions: [
      "Vraag om de berekening van het nieuwe bedrag.",
      "Controleer of de verhoging past binnen de regels.",
      "Verstuur de reactie uiterlijk 18 juli 2026.",
    ],
    full:
      "Beste heer/mevrouw,\n\nDank voor uw brief over de voorgestelde huurverhoging. Ik ontvang graag de volledige onderbouwing van het nieuwe bedrag, inclusief de berekening en de datum waarop de wijziging ingaat. Na ontvangst controleer ik het voorstel en reageer ik inhoudelijk.\n\nMet vriendelijke groet,\nNour",
    deadline: "18 juli 2026",
    calendarDate: "20260718",
    fileName: "lifepilot-briefanalyse.txt",
  },
  week: {
    key: "week",
    label: "Plan mijn week",
    prompt:
      "Plan mijn week met werkblokken, afspraken, administratie en rustmomenten.",
    conclusion:
      "Je week is gebalanceerd met drie focusblokken en ruimte voor herstel.",
    details: [
      "Maandag en woensdag zijn geschikt voor diep werk.",
      "Administratie staat ingepland op dinsdagmiddag.",
      "Vrijdag blijft licht, met ruimte voor afronden.",
    ],
    actions: [
      "Blokkeer maandag 09:00 tot 11:00 voor focuswerk.",
      "Plan administratie dinsdag om 15:00.",
      "Laat vrijdagmiddag vrij voor uitloop.",
    ],
    full:
      "Weekplanning\n\nMaandag: focuswerk en korte planning.\nDinsdag: klantreacties en administratie.\nWoensdag: diep werk en documentcontrole.\nDonderdag: afspraken en opvolging.\nVrijdag: afronden, reflectie en lichte taken.",
    deadline: "Deze week",
    calendarDate: "20260717",
    fileName: "lifepilot-weekplanning.txt",
  },
  email: {
    key: "email",
    label: "Schrijf een professionele e-mail",
    prompt:
      "Schrijf een professionele e-mail om een afspraak netjes te verplaatsen.",
    conclusion:
      "Er staat een korte, vriendelijke e-mail klaar met een duidelijke vraag.",
    details: [
      "De toon is professioneel en niet te formeel.",
      "De ontvanger krijgt direct twee alternatieve momenten.",
      "De reden blijft kort, zonder overbodige uitleg.",
    ],
    actions: [
      "Kies twee beschikbare momenten.",
      "Controleer de naam van de ontvanger.",
      "Verstuur de e-mail vandaag.",
    ],
    full:
      "Beste [naam],\n\nIk wil onze afspraak graag verplaatsen. Zou dinsdag om 10:00 of donderdag om 14:00 voor u passen? Als een ander moment beter uitkomt, hoor ik dat natuurlijk graag.\n\nMet vriendelijke groet,\nNour",
    deadline: "Vandaag",
    calendarDate: "20260713",
    fileName: "lifepilot-email.txt",
  },
  budget: {
    key: "budget",
    label: "Maak een maandbudget",
    prompt:
      "Maak een overzichtelijk maandbudget met vaste lasten, sparen en vrije ruimte.",
    conclusion:
      "Je maandbudget houdt vaste lasten, spaardoel en vrije ruimte gescheiden.",
    details: [
      "Vaste lasten staan bovenaan voor snel overzicht.",
      "Sparen krijgt een vast bedrag direct na inkomen.",
      "Vrije ruimte wordt per week verdeeld.",
    ],
    actions: [
      "Voeg je werkelijke vaste lasten toe.",
      "Kies een spaardoel voor deze maand.",
      "Exporteer het overzicht naar Excel of PDF.",
    ],
    full:
      "Maandbudget\n\nInkomen: €2.850\nVaste lasten: €1.420\nSparen: €350\nBoodschappen: €420\nVrije ruimte: €660\n\nAdvies: verdeel vrije ruimte over vier weken en reserveer onverwachte kosten apart.",
    deadline: "Maandelijks",
    calendarDate: "20260731",
    fileName: "lifepilot-maandbudget.txt",
  },
  compare: {
    key: "compare",
    label: "Vergelijk twee documenten",
    prompt:
      "Vergelijk deze twee documenten en geef de belangrijkste verschillen.",
    conclusion:
      "De tweede versie bevat drie inhoudelijke wijzigingen en een nieuwe betalingstermijn.",
    details: [
      "De looptijd is verlengd van 6 naar 12 maanden.",
      "De opzegtermijn is aangepast naar 30 dagen.",
      "Er is een extra clausule toegevoegd over automatische verlenging.",
    ],
    actions: [
      "Controleer de aangepaste looptijd.",
      "Vraag bevestiging over de opzegtermijn.",
      "Bewaar de vergelijking bij het contract.",
    ],
    full:
      "Documentvergelijking\n\nBelangrijkste wijzigingen:\n1. Looptijd aangepast naar 12 maanden.\n2. Opzegtermijn aangepast naar 30 dagen.\n3. Nieuwe clausule over automatische verlenging toegevoegd.\n\nAanbevolen: vraag schriftelijke bevestiging voordat je akkoord gaat.",
    deadline: "Voor ondertekening",
    calendarDate: "20260720",
    fileName: "lifepilot-documentvergelijking.txt",
  },
};

const suggestionKeys: ResultKey[] = ["week", "letter", "email", "budget", "compare"];

const capabilities = [
  "Plannen",
  "Schrijven",
  "Vergelijken",
  "Rekenen",
  "Analyseren",
  "Exporteren",
];

const storySections = [
  {
    id: "hoe-het-werkt",
    eyebrow: "Eén invoerveld",
    title: "Vertel wat je nodig hebt. LifePilot regelt de rest.",
    body:
      "Je hoeft niet te kiezen tussen losse tools. LifePilot herkent de taak, kiest de juiste structuur en toont direct de volgende stap.",
    items: capabilities,
  },
  {
    id: "persoonlijk",
    eyebrow: "Documenten",
    title: "Van ingewikkelde brief naar duidelijke actie.",
    body:
      "Een moeilijke tekst verandert in een korte uitleg, een datum, concrete vervolgstappen en een bewerkbare reactie.",
    items: ["Eenvoudige uitleg", "Belangrijke datum", "Vervolgstappen", "Antwoordbrief"],
  },
  {
    id: "planning",
    eyebrow: "Planning",
    title: "Een planning die rekening houdt met jouw leven.",
    body:
      "Afspraken, taken, rustmomenten en prioriteiten komen samen in één rustige planning die niet overvol voelt.",
    items: ["Afspraken", "Taken", "Rustmomenten", "Prioriteiten"],
  },
  {
    id: "bestanden",
    eyebrow: "Bestanden",
    title: "Van één zin naar een compleet bestand.",
    body:
      "Vraag om een budget, planning, boodschappenlijst, PDF, Word-document of Excel-overzicht en werk daarna direct verder.",
    items: ["Excel", "PDF", "Word", "Boodschappenlijst", "Maandbudget", "Planning"],
  },
];

const todayItems = [
  ["09:30", "Belastingbrief controleren"],
  ["13:00", "Klantmail afronden"],
  ["16:30", "Weekplanning bijwerken"],
];

const recentItems = [
  "Huurbrief samengevat",
  "Maandbudget gemaakt",
  "E-mail concept opgeslagen",
];

const plans = [
  {
    name: "Gratis",
    price: "€0",
    description: "Voor gebruikers die LifePilot willen ontdekken.",
    benefits: [
      "Basisassistent",
      "5 documenten per maand",
      "Eenvoudige planning",
      "Tekstconcepten",
    ],
  },
  {
    name: "Premium",
    price: "€9,99",
    description: "Voor dagelijks persoonlijk gebruik.",
    badge: "Meest gekozen",
    benefits: [
      "Onbeperkte gesprekken",
      "Documentanalyse",
      "Planning en taken",
      "PDF- en Word-export",
      "Persoonlijk geheugen",
      "Prioriteit bij verwerking",
    ],
  },
  {
    name: "Premium Plus",
    price: "€19,99",
    description: "Voor intensief gebruik en zelfstandigen.",
    benefits: [
      "Alles in Premium",
      "Documenten vergelijken",
      "Excel-export",
      "Zakelijke sjablonen",
      "Snellere verwerking",
      "Uitgebreide bestandsruimte",
    ],
  },
];

export default function Home() {
  const [activeKey, setActiveKey] = useState<ResultKey>("letter");
  const [prompt, setPrompt] = useState(results.letter.prompt);
  const [status, setStatus] = useState("Resultaat klaar voor gebruik.");
  const [saved, setSaved] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const uploadRef = useRef<HTMLInputElement>(null);

  const activeResult = results[activeKey];

  function chooseSuggestion(key: ResultKey) {
    setActiveKey(key);
    setPrompt(results[key].prompt);
    setStatus(`${results[key].label} staat klaar.`);
    setSaved(false);
  }

  function submitPrompt(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedPrompt = prompt.toLowerCase();
    const matched = suggestionKeys.find((key) => {
      const labelWord = results[key].label.toLowerCase().split(" ")[0];
      const taskWord = results[key].prompt.toLowerCase().split(" ")[0];
      return normalizedPrompt.includes(labelWord) || normalizedPrompt.includes(taskWord);
    });
    if (matched) {
      setActiveKey(matched);
    }
    setStatus("LifePilot heeft je vraag verwerkt.");
    setSaved(false);
  }

  function downloadText(name: string, text: string) {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function downloadCalendar() {
    const body = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "BEGIN:VEVENT",
      "SUMMARY:LifePilot actie opvolgen",
      "DESCRIPTION:" + activeResult.actions.join(" "),
      `DTSTART;VALUE=DATE:${activeResult.calendarDate}`,
      `DTEND;VALUE=DATE:${activeResult.calendarDate}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\n");
    downloadText("lifepilot-deadline.ics", body);
    setStatus("Agenda-bestand is aangemaakt.");
  }

  async function shareResult() {
    try {
      await navigator.clipboard.writeText(activeResult.full);
      setStatus("Resultaat is gekopieerd.");
    } catch {
      downloadText(activeResult.fileName, activeResult.full);
      setStatus("Kopiëren lukte niet; het bestand is gedownload.");
    }
  }

  function saveResult() {
    localStorage.setItem("lifepilot:last-result", JSON.stringify(activeResult));
    setSaved(true);
    setStatus("Resultaat is opgeslagen.");
  }

  function editResult() {
    setPrompt(activeResult.full);
    inputRef.current?.focus();
    setStatus("Concept staat klaar om te bewerken.");
  }

  function regenerate() {
    const generatedAt = new Intl.DateTimeFormat("nl-NL", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date());
    setStatus(`Nieuwe versie gegenereerd om ${generatedAt}.`);
    setSaved(false);
  }

  function startSpeechInput() {
    const speechWindow = window as typeof window & {
      webkitSpeechRecognition?: new () => {
        lang: string;
        interimResults: boolean;
        start: () => void;
        onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
        onerror: (() => void) | null;
      };
    };
    const SpeechRecognition = speechWindow.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setStatus("Spraakinvoer is niet beschikbaar in deze browser.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "nl-NL";
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript;
      if (transcript) {
        setPrompt(transcript);
        setStatus("Spraakinvoer is toegevoegd.");
      }
    };
    recognition.onerror = () => setStatus("Spraakinvoer kon niet worden gestart.");
    recognition.start();
    setStatus("Luisteren gestart.");
  }

  return (
    <main className="min-h-screen bg-[#f7f7f5] pb-20 text-[#151515] lg:pb-0">
      <header className="sticky top-0 z-40 border-b border-black/5 bg-white/86 backdrop-blur-xl">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <a className="flex items-center gap-3" href="#home" aria-label="LifePilot AI home">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#151515] text-sm font-semibold text-white">
              LP
            </span>
            <span className="text-sm font-semibold">LifePilot AI</span>
          </a>
          <div className="hidden items-center gap-7 text-sm text-[#5f625d] lg:flex">
            <a href="#functies">Functies</a>
            <a href="#persoonlijk">Voor persoonlijk gebruik</a>
            <a href="#ondernemers">Voor ondernemers</a>
            <a href="#prijzen">Prijzen</a>
          </div>
          <div className="flex items-center gap-3">
            <a className="hidden text-sm text-[#5f625d] sm:inline" href="#assistent">
              Inloggen
            </a>
            <a
              className="rounded-full bg-[#151515] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_14px_34px_rgba(0,0,0,0.16)] transition hover:-translate-y-0.5 hover:bg-black focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[#6c876b]"
              href="#proberen"
            >
              Probeer gratis
            </a>
          </div>
        </nav>
      </header>

      <section
        className="mx-auto max-w-7xl px-5 pb-12 pt-14 sm:px-8 sm:pt-20 lg:pb-16"
        id="home"
      >
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-5 text-sm font-medium text-[#60745e]">
            Persoonlijke assistent voor documenten, planning en werk
          </p>
          <h1 className="text-balance text-5xl font-semibold leading-[1.04] text-[#111] sm:text-6xl lg:text-7xl">
            Eén slimme assistent voor alles wat je moet regelen.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-8 text-[#62655f]">
            Plan je week, begrijp moeilijke brieven, schrijf professionele
            berichten en maak documenten vanuit één eenvoudige omgeving.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              className="w-full rounded-full bg-[#151515] px-7 py-3.5 text-center text-sm font-semibold text-white shadow-[0_18px_48px_rgba(0,0,0,0.18)] transition hover:-translate-y-0.5 hover:bg-black focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[#6c876b] sm:w-auto"
              href="#proberen"
            >
              Probeer gratis
            </a>
            <a
              className="w-full rounded-full border border-black/10 bg-white px-7 py-3.5 text-center text-sm font-semibold text-[#202020] shadow-sm transition hover:-translate-y-0.5 hover:border-black/20 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[#6c876b] sm:w-auto"
              href="#hoe-het-werkt"
            >
              Bekijk hoe het werkt
            </a>
          </div>
        </div>

        <ProductFrame result={activeResult} chooseSuggestion={chooseSuggestion} />
      </section>

      <section className="border-y border-black/6 bg-white" id="functies">
        <div className="mx-auto grid max-w-7xl gap-5 px-5 py-10 sm:px-8 md:grid-cols-3">
          <Metric label="Gemiddelde verwerking" value="12 sec." />
          <Metric label="Belangrijkste actie zichtbaar" value="Altijd" />
          <Metric label="Export naar bestanden" value="PDF, Word, Excel" />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-24">
        <div className="grid gap-5 lg:grid-cols-4">
          {storySections.map((section) => (
            <article
              className="rounded-lg border border-black/7 bg-white p-6 shadow-[0_18px_45px_rgba(20,20,15,0.06)] transition hover:-translate-y-1"
              id={section.id}
              key={section.id}
            >
              <p className="text-sm font-medium text-[#60745e]">{section.eyebrow}</p>
              <h2 className="mt-4 text-2xl font-semibold leading-tight text-[#151515]">
                {section.title}
              </h2>
              <p className="mt-4 text-sm leading-7 text-[#62655f]">{section.body}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                {section.items.map((item) => (
                  <span
                    className="rounded-full bg-[#f1f1ef] px-3 py-1.5 text-xs font-medium text-[#555852]"
                    key={item}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-[#ecefeb] px-5 py-16 sm:px-8 lg:py-24" id="proberen">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-sm font-medium text-[#60745e]">App-dashboard</p>
            <h2 className="mt-4 text-4xl font-semibold leading-tight text-[#111] sm:text-5xl">
              Goedemorgen, Nour. Wat wil je vandaag regelen?
            </h2>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
            <section
              className="rounded-lg border border-black/7 bg-white p-5 shadow-[0_20px_55px_rgba(30,30,20,0.08)]"
              id="assistent"
            >
              <form onSubmit={submitPrompt}>
                <label className="text-sm font-semibold text-[#252722]" htmlFor="lifepilot-prompt">
                  Vraag LifePilot om iets te regelen
                </label>
                <input
                  className="sr-only"
                  onChange={(event) => {
                    const fileName = event.target.files?.[0]?.name;
                    if (fileName) {
                      setStatus(`${fileName} is toegevoegd.`);
                    }
                  }}
                  ref={uploadRef}
                  type="file"
                />
                <textarea
                  className="mt-3 min-h-36 w-full resize-none rounded-lg border border-black/10 bg-[#fbfbfa] p-4 text-base leading-7 text-[#1d1f1c] outline-none transition focus:border-[#6c876b] focus:bg-white focus:ring-4 focus:ring-[#dce8d8]"
                  id="lifepilot-prompt"
                  onChange={(event) => setPrompt(event.target.value)}
                  placeholder="Vraag LifePilot om iets te regelen..."
                  ref={inputRef}
                  value={prompt}
                />
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex gap-2">
                    <button
                      className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-[#4e514c] transition hover:border-black/20 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[#6c876b]"
                      onClick={() => uploadRef.current?.click()}
                      type="button"
                    >
                      Uploaden
                    </button>
                    <button
                      className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-[#4e514c] transition hover:border-black/20 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[#6c876b]"
                      onClick={startSpeechInput}
                      type="button"
                    >
                      Spraak
                    </button>
                  </div>
                  <button
                    className="rounded-full bg-[#151515] px-6 py-3 text-sm font-semibold text-white shadow-[0_14px_34px_rgba(0,0,0,0.16)] transition hover:-translate-y-0.5 hover:bg-black focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[#6c876b]"
                    type="submit"
                  >
                    Regel dit
                  </button>
                </div>
              </form>

              <div className="mt-6 flex flex-wrap gap-2">
                {suggestionKeys.map((key) => (
                  <button
                    className={`rounded-full px-4 py-2 text-sm font-medium transition focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[#6c876b] ${
                      activeKey === key
                        ? "bg-[#dfeadd] text-[#304c31]"
                        : "bg-[#f1f1ef] text-[#555852] hover:bg-[#e9e9e6]"
                    }`}
                    key={key}
                    onClick={() => chooseSuggestion(key)}
                    type="button"
                  >
                    {results[key].label}
                  </button>
                ))}
              </div>
            </section>

            <aside className="grid gap-5">
              <DashboardPanel title="Vandaag" items={todayItems.map(([time, item]) => `${time} · ${item}`)} />
              <DashboardPanel title="Recent" items={recentItems} />
              <DashboardPanel
                title="Suggesties"
                items={[
                  "Maak een professioneel document.",
                  "Analyseer en vergelijk bestanden.",
                  "Exporteer naar Excel of PDF.",
                ]}
              />
            </aside>
          </div>

          <ResultCard
            editResult={editResult}
            downloadCalendar={downloadCalendar}
            downloadResult={() => {
              downloadText(activeResult.fileName, activeResult.full);
              setStatus("Bestand is gedownload.");
            }}
            regenerate={regenerate}
            result={activeResult}
            saveResult={saveResult}
            saved={saved}
            shareResult={shareResult}
            status={status}
          />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-24" id="ondernemers">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-sm font-medium text-[#60745e]">Persoonlijk en zakelijk</p>
            <h2 className="mt-4 text-4xl font-semibold leading-tight text-[#111] sm:text-5xl">
              Alles persoonlijk, niets ingewikkeld.
            </h2>
            <p className="mt-5 text-lg leading-8 text-[#62655f]">
              LifePilot leert alleen wat jij wilt delen. Jij bepaalt wat wordt
              opgeslagen, onthouden, verwijderd en gekoppeld.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              "Gegevens blijven van de gebruiker.",
              "Koppelingen zijn zichtbaar en aanpasbaar.",
              "Persoonlijk geheugen kan per onderdeel uit.",
              "Documenten en agenda's worden rustig gescheiden.",
            ].map((item) => (
              <div className="rounded-lg border border-black/7 bg-white p-5 shadow-sm" key={item}>
                <p className="text-base font-semibold leading-7 text-[#20221f]">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-black/6 bg-white px-5 py-16 sm:px-8 lg:py-24" id="prijzen">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-sm font-medium text-[#60745e]">Prijzen</p>
            <h2 className="mt-4 text-4xl font-semibold leading-tight text-[#111] sm:text-5xl">
              Eenvoudige abonnementen zonder kleine lettertjes.
            </h2>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {plans.map((plan) => (
              <article
                className={`relative rounded-lg border p-6 shadow-[0_18px_45px_rgba(20,20,15,0.06)] ${
                  plan.badge
                    ? "border-[#9bb396] bg-[#f7fbf5]"
                    : "border-black/7 bg-white"
                }`}
                key={plan.name}
              >
                {plan.badge ? (
                  <span className="absolute right-5 top-5 rounded-full bg-[#dfeadd] px-3 py-1 text-xs font-semibold text-[#304c31]">
                    {plan.badge}
                  </span>
                ) : null}
                <h3 className="text-xl font-semibold text-[#151515]">{plan.name}</h3>
                <p className="mt-3 text-sm leading-6 text-[#62655f]">{plan.description}</p>
                <div className="mt-6 flex items-end gap-2">
                  <span className="text-4xl font-semibold">{plan.price}</span>
                  <span className="pb-1 text-sm text-[#62655f]">per maand</span>
                </div>
                <ul className="mt-7 space-y-3">
                  {plan.benefits.map((benefit) => (
                    <li className="flex gap-3 text-sm leading-6 text-[#444842]" key={benefit}>
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#6c876b]" />
                      {benefit}
                    </li>
                  ))}
                </ul>
                <a
                  className={`mt-8 block rounded-full px-5 py-3 text-center text-sm font-semibold transition focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[#6c876b] ${
                    plan.badge
                      ? "bg-[#151515] text-white hover:bg-black"
                      : "border border-black/10 text-[#202020] hover:border-black/20"
                  }`}
                  href="#proberen"
                >
                  Kies {plan.name}
                </a>
              </article>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3 text-sm text-[#62655f]">
            {[
              "Maandelijks opzegbaar",
              "Veilig betalen",
              "Geen verborgen kosten",
              "Gegevens blijven van de gebruiker",
            ].map((item) => (
              <span className="rounded-full bg-[#f1f1ef] px-4 py-2" key={item}>
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-black/8 bg-white/92 px-4 py-3 backdrop-blur-xl lg:hidden">
        <div className="mx-auto grid max-w-md grid-cols-5 gap-1 text-center text-xs font-medium text-[#5f625d]">
          <a className="rounded-lg px-2 py-2 hover:bg-[#f1f1ef]" href="#home">Home</a>
          <a className="rounded-lg px-2 py-2 hover:bg-[#f1f1ef]" href="#assistent">Assistent</a>
          <a className="rounded-lg px-2 py-2 hover:bg-[#f1f1ef]" href="#planning">Planning</a>
          <a className="rounded-lg px-2 py-2 hover:bg-[#f1f1ef]" href="#bestanden">Documenten</a>
          <a className="rounded-lg px-2 py-2 hover:bg-[#f1f1ef]" href="#ondernemers">Profiel</a>
        </div>
      </nav>
    </main>
  );
}

function ProductFrame({
  result,
  chooseSuggestion,
}: {
  result: Result;
  chooseSuggestion: (key: ResultKey) => void;
}) {
  return (
    <div className="mx-auto mt-14 w-full max-w-5xl rounded-lg border border-black/8 bg-white p-3 shadow-[0_30px_85px_rgba(30,30,20,0.12)]">
      <div className="overflow-hidden rounded-lg border border-black/6 bg-[#fbfbfa]">
        <div className="flex items-center justify-between gap-4 border-b border-black/6 bg-white px-5 py-4">
          <div>
            <p className="text-xs font-medium uppercase text-[#7a7d77]">LifePilot Assistent</p>
            <p className="mt-1 text-sm font-semibold text-[#1f211e]">{result.label}</p>
          </div>
          <button
            className="rounded-full bg-[#e7f0e4] px-3 py-1.5 text-xs font-medium text-[#3f6241] transition hover:bg-[#dfeadd]"
            onClick={() => chooseSuggestion(result.key)}
            type="button"
          >
            Open taak
          </button>
        </div>

        <div className="grid lg:grid-cols-[0.92fr_1.08fr]">
          <div className="border-b border-black/6 p-5 lg:border-b-0 lg:border-r">
            <p className="text-sm font-semibold text-[#282a26]">Vraag aan LifePilot</p>
            <div className="mt-3 rounded-lg border border-black/8 bg-white p-5 text-left shadow-sm">
              <p className="text-lg leading-8 text-[#1d1f1c]">“{result.prompt}”</p>
              <div className="mt-5 flex flex-wrap gap-2 text-xs text-[#686b65]">
                <span className="rounded-full bg-[#f1f1ef] px-3 py-1.5">
                  Huurbrief.pdf
                </span>
                <span className="rounded-full bg-[#f1f1ef] px-3 py-1.5">
                  Prioriteit normaal
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3 p-5">
            {[
              ["Samenvatting", result.conclusion],
              ["Deadline", result.deadline ?? "Geen datum gevonden"],
              ["Aanbevolen actie", result.actions[0]],
              ["Conceptreactie", "Een bewerkbare reactie staat klaar."],
            ].map(([title, body], index) => (
              <article
                className="animate-rise rounded-lg border border-black/7 bg-white p-4 shadow-sm"
                key={title}
                style={{ animationDelay: `${index * 110}ms` }}
              >
                <div className="flex gap-4">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#e7f0e4] text-sm font-semibold text-[#446645]">
                    {index + 1}
                  </span>
                  <div>
                    <h2 className="text-sm font-semibold text-[#1d1f1c]">{title}</h2>
                    <p className="mt-1 text-sm leading-6 text-[#62655f]">{body}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-black/7 bg-[#fbfbfa] p-5">
      <p className="text-sm text-[#62655f]">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-[#151515]">{value}</p>
    </div>
  );
}

function DashboardPanel({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="rounded-lg border border-black/7 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-[#20221f]">{title}</h3>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li className="rounded-lg bg-[#f7f7f5] px-4 py-3 text-sm leading-6 text-[#51544f]" key={item}>
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

function ResultCard({
  result,
  status,
  saved,
  editResult,
  downloadResult,
  downloadCalendar,
  saveResult,
  shareResult,
  regenerate,
}: {
  result: Result;
  status: string;
  saved: boolean;
  editResult: () => void;
  downloadResult: () => void;
  downloadCalendar: () => void;
  saveResult: () => void;
  shareResult: () => void;
  regenerate: () => void;
}) {
  return (
    <section className="mt-5 rounded-lg border border-black/7 bg-white p-5 shadow-[0_20px_55px_rgba(30,30,20,0.08)]">
      <div className="flex flex-col gap-3 border-b border-black/6 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-[#60745e]">Resultaat</p>
          <h2 className="mt-2 text-2xl font-semibold text-[#151515]">
            Wat betekent dit en wat moet je doen?
          </h2>
        </div>
        <span
          aria-live="polite"
          className="rounded-full bg-[#f1f1ef] px-4 py-2 text-sm font-medium text-[#555852]"
        >
          {saved ? "Opgeslagen" : status}
        </span>
      </div>

      <div className="grid gap-5 py-5 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-4">
          <ResultBlock title="Korte conclusie" lines={[result.conclusion]} />
          <ResultBlock title="Belangrijkste informatie" lines={result.details} />
          <ResultBlock title="Aanbevolen acties" lines={result.actions} />
          {result.deadline ? (
            <ResultBlock title="Belangrijke datum" lines={[result.deadline]} strong />
          ) : null}
        </div>
        <div className="rounded-lg border border-black/7 bg-[#fbfbfa] p-5">
          <h3 className="text-sm font-semibold text-[#20221f]">Volledig resultaat</h3>
          <pre className="mt-4 whitespace-pre-wrap font-sans text-sm leading-7 text-[#4d514a]">
            {result.full}
          </pre>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-t border-black/6 pt-5">
        <ActionButton label="Bewerken" onClick={editResult} />
        <ActionButton label="Downloaden" onClick={downloadResult} />
        <ActionButton label="In agenda zetten" onClick={downloadCalendar} />
        <ActionButton label="Opslaan" onClick={saveResult} />
        <ActionButton label="Delen" onClick={shareResult} />
        <ActionButton label="Opnieuw genereren" onClick={regenerate} />
      </div>
    </section>
  );
}

function ResultBlock({
  title,
  lines,
  strong,
}: {
  title: string;
  lines: string[];
  strong?: boolean;
}) {
  return (
    <section className="rounded-lg border border-black/7 bg-[#fbfbfa] p-5">
      <h3 className="text-sm font-semibold text-[#20221f]">{title}</h3>
      <ul className="mt-3 space-y-2">
        {lines.map((line) => (
          <li
            className={`text-sm leading-6 ${strong ? "font-semibold text-[#304c31]" : "text-[#555852]"}`}
            key={line}
          >
            {line}
          </li>
        ))}
      </ul>
    </section>
  );
}

function ActionButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      className="rounded-full border border-black/10 bg-white px-4 py-2.5 text-sm font-semibold text-[#252722] transition hover:-translate-y-0.5 hover:border-black/20 hover:bg-[#fbfbfa] focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[#6c876b]"
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}
