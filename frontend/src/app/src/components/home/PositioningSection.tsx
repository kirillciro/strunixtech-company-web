import { CheckCircle2, MessageCircleMore, LayoutTemplate, Eye, Hammer } from "lucide-react";

type SectionCopy = {
  riskTitle: string;
  riskItems: string[];
  fitTitle: string;
  fitItems: string[];
  nextTitle: string;
  nextSteps: string[];
  supportTitle: string;
  supportPoints: string[];
};

function getCopy(lang: string): SectionCopy {
  if (lang === "nl") {
    return {
      riskTitle: "Waarom klanten voor ons kiezen",
      riskItems: [
        "Preview voor betaling",
        "Geen lange contracten",
        "Direct contact met ontwikkelaar",
        "Duidelijke scope voor de bouw start",
      ],
      fitTitle: "Perfect voor",
      fitItems: ["MKB-bedrijven", "Startups", "Agencies", "Dienstverleners"],
      nextTitle: "Wat gebeurt er na je chat?",
      nextSteps: [
        "We begrijpen je idee",
        "Je kiest een template",
        "We maken je preview",
        "Jij keurt goed en wij bouwen",
      ],
      supportTitle: "Echte samenwerking, geen ruis",
      supportPoints: [
        "Werk direct met een ontwikkelaar",
        "Geen tussenlagen",
        "Geen onnodige vertraging",
        "Heldere communicatie",
      ],
    };
  }

  return {
    riskTitle: "Why Clients Choose Us",
    riskItems: [
      "Preview before payment",
      "No long contracts",
      "Direct developer communication",
      "Clear scope before build",
    ],
    fitTitle: "Perfect For",
    fitItems: ["Small businesses", "Startups", "Agencies", "Service providers"],
    nextTitle: "What Happens Next?",
    nextSteps: [
      "We understand your idea",
      "You choose a template",
      "We create your preview",
      "You approve and we build",
    ],
    supportTitle: "Real developer support, start to launch",
    supportPoints: [
      "Work directly with a developer",
      "No middlemen",
      "No unnecessary delays",
      "Clear communication",
    ],
  };
}

const stepIcons = [MessageCircleMore, LayoutTemplate, Eye, Hammer];

export default function PositioningSection({ lang }: { lang: string }) {
  const copy = getCopy(lang);

  return (
    <section className="py-10 sm:py-14 border-y border-slate-800 bg-slate-950/70 reveal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid gap-6 lg:grid-cols-3">
        <article className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6 reveal reveal-delay-1">
          <h3 className="text-white text-lg font-semibold mb-4">{copy.riskTitle}</h3>
          <ul className="space-y-2 text-sm text-slate-300">
            {copy.riskItems.map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6 reveal reveal-delay-2">
          <h3 className="text-white text-lg font-semibold mb-4">{copy.fitTitle}</h3>
          <div className="flex flex-wrap gap-2.5 mb-6">
            {copy.fitItems.map((item) => (
              <span
                key={item}
                className="rounded-full border border-cyan-400/35 bg-cyan-500/8 px-3 py-1.5 text-xs font-semibold text-cyan-100"
              >
                {item}
              </span>
            ))}
          </div>

          <h4 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-300 mb-3">
            {copy.supportTitle}
          </h4>
          <p className="text-sm text-slate-300 leading-relaxed">
            {copy.supportPoints.join(" • ")}
          </p>
        </article>

        <article className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6 reveal reveal-delay-3">
          <h3 className="text-white text-lg font-semibold mb-4">{copy.nextTitle}</h3>
          <ol className="space-y-3">
            {copy.nextSteps.map((step, index) => {
              const Icon = stepIcons[index] ?? MessageCircleMore;
              return (
                <li key={step} className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan-500/15 text-xs font-bold text-cyan-100">
                    {index + 1}
                  </span>
                  <span className="flex items-center gap-2 text-sm text-slate-200">
                    <Icon className="h-4 w-4 text-cyan-300" />
                    {step}
                  </span>
                </li>
              );
            })}
          </ol>
        </article>
      </div>
    </section>
  );
}
