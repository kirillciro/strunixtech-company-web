import { templateCategories } from "@/lib/template-categories";
import Link from "next/link";
import {
  ArrowRight,
  Bot,
  BriefcaseBusiness,
  CalendarDays,
  LayoutDashboard,
  LayoutTemplate,
  MessageSquareMore,
  MousePointerClick,
  Rocket,
  ShoppingBag,
  Smartphone,
  UserRound,
} from "lucide-react";

const categoryIconMap = {
  briefcase: BriefcaseBusiness,
  calendar: CalendarDays,
  "shopping-bag": ShoppingBag,
  "layout-dashboard": LayoutDashboard,
  "messages-square": MessageSquareMore,
  smartphone: Smartphone,
  bot: Bot,
  "mouse-pointer-click": MousePointerClick,
  "user-round": UserRound,
  rocket: Rocket,
} as const;

const categoryAccent = [
  {
    from: "from-cyan-500",
    to: "to-blue-600",
    glow: "group-hover:shadow-cyan-500/20",
    border: "group-hover:border-cyan-500/50",
    iconBg: "from-cyan-500/20 to-blue-600/10",
    iconColor: "text-cyan-400",
    badge: "bg-cyan-500/10 text-cyan-300 border-cyan-500/20",
  },
  {
    from: "from-blue-500",
    to: "to-violet-600",
    glow: "group-hover:shadow-blue-500/20",
    border: "group-hover:border-blue-500/50",
    iconBg: "from-blue-500/20 to-violet-600/10",
    iconColor: "text-blue-400",
    badge: "bg-blue-500/10 text-blue-300 border-blue-500/20",
  },
  {
    from: "from-violet-500",
    to: "to-purple-600",
    glow: "group-hover:shadow-violet-500/20",
    border: "group-hover:border-violet-500/50",
    iconBg: "from-violet-500/20 to-purple-600/10",
    iconColor: "text-violet-400",
    badge: "bg-violet-500/10 text-violet-300 border-violet-500/20",
  },
  {
    from: "from-emerald-500",
    to: "to-teal-600",
    glow: "group-hover:shadow-emerald-500/20",
    border: "group-hover:border-emerald-500/50",
    iconBg: "from-emerald-500/20 to-teal-600/10",
    iconColor: "text-emerald-400",
    badge: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
  },
];

type TemplatesContent = {
  title: string;
  description: string;
  featuredTitle: string;
  explore: string;
  demoPreview: string;
  featuredDemos: Array<{
    name: string;
    category: string;
  }>;
  categories: Record<string, { title: string; detail: string }>;
};

export default function TemplatesShowcaseSection({
  content,
  lang,
}: {
  content: TemplatesContent;
  lang: string;
}) {
  const visibleCategories = templateCategories.slice(0, 4);
  const viewAllLabel =
    lang === "nl" ? "Bekijk alle templates" : "View all templates";

  return (
    <section className="relative py-20 sm:py-28 bg-slate-950 overflow-hidden reveal">
      {/* Subtle background pattern */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle, #475569 1px, transparent 1px)",
            backgroundSize: "32px 32px",
            opacity: 0.12,
            maskImage:
              "linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)",
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-14 sm:mb-20 reveal reveal-delay-1">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 mb-5">
            <LayoutTemplate className="w-3.5 h-3.5" />
            Templates
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
            <span className="bg-linear-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
              {content.title}
            </span>
          </h2>
          <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            {content.description}
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 mb-10 sm:mb-14">
          {visibleCategories.map((category, index) => {
            const Icon = categoryIconMap[category.icon];
            const accent = categoryAccent[index % categoryAccent.length];
            const localizedCategory = content.categories[category.slug] ?? {
              title: category.title,
              detail: category.detail,
            };
            return (
              <Link
                key={category.slug}
                href={`/${lang}/templates/${category.slug}`}
                className={`group relative rounded-2xl border border-slate-700/60 bg-slate-900/60 p-6 sm:p-8 transition-all duration-300 hover:shadow-xl ${accent.glow} ${accent.border} reveal card-hover-lift overflow-hidden`}
                style={{ transitionDelay: `${index * 80}ms` }}
              >
                {/* Inner gradient wash */}
                <div
                  className={`absolute inset-0 bg-linear-to-br ${accent.iconBg} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}
                />

                <div className="relative">
                  {/* Icon + badge row */}
                  <div className="flex items-start justify-between mb-5">
                    <div
                      className={`flex items-center justify-center w-12 h-12 rounded-xl bg-linear-to-br ${accent.iconBg} border border-white/10`}
                    >
                      <Icon className={`w-6 h-6 ${accent.iconColor}`} />
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${accent.badge}`}
                    >
                      Templates
                    </span>
                  </div>

                  {/* Text */}
                  <h3 className="text-white font-semibold text-lg sm:text-xl mb-2 group-hover:text-white transition-colors leading-snug">
                    {localizedCategory.title}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-6">
                    {localizedCategory.detail}
                  </p>

                  {/* Explore link */}
                  <div
                    className={`inline-flex items-center gap-1.5 text-sm font-medium ${accent.iconColor} group-hover:gap-2.5 transition-all`}
                  >
                    {content.explore}
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* View all CTA */}
        <div className="text-center reveal reveal-delay-3">
          <Link
            href={`/${lang}/dashboard?tab=templates`}
            className="btn-soft-motion inline-flex items-center gap-2.5 px-8 py-4 rounded-xl border border-slate-600 bg-slate-900/60 text-sm font-semibold text-slate-100 hover:border-cyan-400 hover:text-cyan-300 hover:bg-slate-800/80 transition-all duration-200 shadow-lg shadow-black/20"
          >
            <LayoutTemplate className="w-4 h-4" />
            {viewAllLabel}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
