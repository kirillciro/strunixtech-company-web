import { templateCategories } from "@/lib/template-categories";
import Link from "next/link";
import {
  Bot,
  BriefcaseBusiness,
  CalendarDays,
  LayoutDashboard,
  MessageSquareMore,
  ShoppingBag,
  Smartphone,
} from "lucide-react";

const categoryIconMap = {
  briefcase: BriefcaseBusiness,
  calendar: CalendarDays,
  "shopping-bag": ShoppingBag,
  "layout-dashboard": LayoutDashboard,
  "messages-square": MessageSquareMore,
  smartphone: Smartphone,
  bot: Bot,
} as const;

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
  const viewAllLabel = lang === "nl" ? "Bekijk alle templates" : "View all templates";

  return (
    <section className="py-14 sm:py-20 bg-slate-800/30 border-y border-slate-700/50 reveal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4 reveal reveal-delay-1">
          <span className="bg-linear-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
            {content.title}
          </span>
        </h2>
        <p className="text-slate-400 text-center mb-10 sm:mb-16 max-w-2xl mx-auto reveal reveal-delay-2">
          {content.description}
        </p>

        {/* Template Categories Grid */}
        <div className="grid md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {visibleCategories.map((category, index) => {
            const Icon = categoryIconMap[category.icon];
            const localizedCategory = content.categories[category.slug] ?? {
              title: category.title,
              detail: category.detail,
            };
            return (
              <Link
                key={category.slug}
                href={`/${lang}/templates/${category.slug}`}
                className="group bg-slate-800/50 border border-slate-700 rounded-lg p-5 sm:p-8 hover:border-cyan-400/50 transition-all hover:bg-slate-800 reveal card-hover-lift"
                style={{ transitionDelay: `${100 + index * 80}ms` }}
              >
                <div className="mb-4">
                  <Icon className="w-9 h-9 text-cyan-300 animate-icon-breathe" />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2 group-hover:text-cyan-300 transition-colors">
                  {localizedCategory.title}
                </h3>
                <p className="text-slate-400 text-sm mb-4">
                  {localizedCategory.detail}
                </p>
                <div className="flex items-center text-cyan-400 group-hover:gap-2 transition-all">
                  {content.explore}
                  <svg
                    className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mb-10 sm:mb-12 text-center">
          <Link
            href={`/${lang}/templates`}
            className="btn-soft-motion inline-flex items-center gap-2 rounded-lg border border-slate-600 px-5 py-3 text-sm font-semibold text-slate-100 hover:border-cyan-400 hover:text-cyan-200"
          >
            + {viewAllLabel}
          </Link>
        </div>

        {/* Demo Projects Showcase */}
        <div className="pt-12 border-t border-slate-700/50 reveal reveal-delay-3">
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-6 sm:mb-8">
            {content.featuredTitle}
          </h3>
          <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
            {content.featuredDemos.map((demo, index) => (
              <Link
                key={demo.name}
                href={`/${lang}/templates/${["business", "bookings", "admin-dashboards"][index]}`}
                className="group bg-linear-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg overflow-hidden hover:border-cyan-400/50 transition-all"
              >
                <div className="h-40 bg-linear-to-br from-cyan-500/10 to-blue-600/10 flex items-center justify-center text-slate-400 group-hover:from-cyan-500/20 group-hover:to-blue-600/20 transition-colors">
                  <span className="text-sm">{content.demoPreview}</span>
                </div>
                <div className="p-6">
                  <h4 className="text-white font-semibold mb-2">{demo.name}</h4>
                  <p className="text-slate-400 text-sm capitalize">
                    {demo.category}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
