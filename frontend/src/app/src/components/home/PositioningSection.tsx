import {
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
  MessageCircleMore,
  LayoutTemplate,
  Eye,
  Hammer,
  ArrowRight,
  Rocket,
  Building2,
  Timer,
  TrendingUp,
} from "lucide-react";
import type { PositioningContent } from "@/lib/content-schema";

// Icons aligned to: preview-first, no risk, direct dev, no hidden costs
const whyIcons = [Eye, ShieldCheck, MessageCircleMore, Zap];
// Icons aligned to: tell us, template, preview, build
const stepIcons = [MessageCircleMore, LayoutTemplate, Eye, Hammer];
// Icons aligned to: direct talk, no layers, fast responses, moving forward
const supportIcons = [MessageCircleMore, Zap, Timer, TrendingUp];
// Icons aligned to: founders, businesses, agencies
const forIcons = [Rocket, Building2, Users];

export default function PositioningSection({
  content,
}: {
  content: PositioningContent;
}) {
  return (
    <section className="relative py-16 sm:py-24 overflow-hidden reveal">
      {/* Section background — subtle gradient + dot pattern */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        {/* Plain slate-950 base — same as hero so there's zero colour change at the seam */}
        <div className="absolute inset-0 bg-slate-950" />
        {/* Circle dot pattern — radial fade from center */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle, #64748b 1.5px, transparent 1.5px)",
            backgroundSize: "32px 32px",
            opacity: 0.35,
            maskImage:
              "linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%)",
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6 sm:space-y-8">
        {/* Row 1 — Why + For side by side on desktop, stacked on mobile */}
        <div className="grid gap-6 sm:gap-8 lg:grid-cols-2">
          {/* Why Clients Choose Us */}
          <article className="reveal reveal-delay-1 relative rounded-3xl border border-slate-700/60 bg-linear-to-br from-slate-900 via-slate-900 to-slate-800/80 overflow-hidden flex flex-col">
            <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-cyan-500/8 blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />

            {/* Image — top half */}
            <div className="relative h-48 sm:h-56 w-full shrink-0 overflow-hidden">
              <img
                src="https://res.cloudinary.com/dhq3nxqt2/image/upload/q_auto/f_auto/v1776101741/com-plat/pexels-a-darmel-7642122_hgnzzt.jpg"
                alt="Developer working on a project"
                className="h-full w-full object-cover object-center"
                loading="lazy"
              />
              {/* Gradient fade into card body */}
              <div className="absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-slate-900 to-transparent" />
            </div>

            {/* Content */}
            <div className="p-7 sm:p-9 pt-5 flex-1">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-500/25 bg-cyan-500/10 px-3.5 py-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">
                  Trust
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-6 leading-tight">
                {content.whyTitle}
              </h3>
              <ul className="space-y-3.5">
                {content.whyItems.map((item, i) => {
                  const Icon = whyIcons[i % whyIcons.length];
                  return (
                    <li key={item} className="flex items-center gap-3.5">
                      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-500/12 border border-cyan-500/20">
                        <Icon className="h-4 w-4 text-cyan-400" />
                      </span>
                      <span className="text-sm sm:text-base text-slate-200 font-medium">
                        {item}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </article>

          {/* Perfect For */}
          <article className="reveal reveal-delay-2 relative rounded-3xl border border-slate-700/60 bg-linear-to-br from-slate-900 via-slate-900 to-blue-950/40 p-7 sm:p-9 overflow-hidden">
            <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-blue-500/8 blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none" />
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/25 bg-blue-500/10 px-3.5 py-1.5">
              <Users className="h-3.5 w-3.5 text-blue-400" />
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-300">
                Audience
              </span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-6 leading-tight">
              {content.forTitle}
            </h3>
            <div className="flex flex-wrap gap-2.5 mb-8">
              {content.forItems.map((item, i) => {
                const ForIcon = forIcons[i % forIcons.length];
                return (
                  <span
                    key={item}
                    className="inline-flex items-center gap-1.5 rounded-2xl border border-blue-400/25 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-100"
                  >
                    <ForIcon className="h-3.5 w-3.5 text-blue-400" />
                    {item}
                  </span>
                );
              })}
            </div>
            <div className="rounded-2xl border border-slate-700/50 bg-slate-800/50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 mb-4">
                {content.supportTitle}
              </p>
              <ul className="space-y-2.5">
                {content.supportPoints.map((point, i) => {
                  const Icon = supportIcons[i % supportIcons.length];
                  return (
                    <li key={point} className="flex items-center gap-3">
                      <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-cyan-500/12 border border-cyan-500/20">
                        <Icon className="h-3.5 w-3.5 text-cyan-400" />
                      </span>
                      <span className="text-sm text-slate-200">{point}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </article>
        </div>

        {/* Row 2 — What Happens Next full width */}
        <article className="reveal reveal-delay-3 relative rounded-3xl border border-slate-700/60 bg-linear-to-br from-slate-900 via-slate-900/95 to-cyan-950/30 p-7 sm:p-9 overflow-hidden">
          <div className="absolute top-1/2 right-0 h-64 w-64 rounded-full bg-cyan-500/6 blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3.5 py-1.5">
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
              Process
            </span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold text-white mb-8 leading-tight">
            {content.nextTitle}
          </h3>
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {content.nextSteps.map((step, index) => {
              const Icon = stepIcons[index] ?? MessageCircleMore;
              return (
                <li
                  key={step}
                  className="relative flex flex-col gap-4 rounded-2xl border border-slate-700/50 bg-slate-800/40 p-5"
                >
                  {/* Connector arrow — only between items on large screens */}
                  {index < content.nextSteps.length - 1 && (
                    <ArrowRight className="hidden lg:block absolute -right-4 top-1/2 -translate-y-1/2 z-10 h-4 w-4 text-slate-600" />
                  )}
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-cyan-500/25 to-blue-500/25 border border-cyan-500/20 text-sm font-bold text-cyan-200">
                      {index + 1}
                    </span>
                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-700/60">
                      <Icon className="h-4 w-4 text-cyan-300" />
                    </span>
                  </div>
                  <p className="text-sm sm:text-base font-medium text-slate-200 leading-snug">
                    {step}
                  </p>
                </li>
              );
            })}
          </ol>
        </article>
      </div>
    </section>
  );
}
