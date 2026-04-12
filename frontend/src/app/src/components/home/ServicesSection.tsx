import { BriefcaseBusiness, Megaphone, Search, SwatchBook } from "lucide-react";

type ServicesContent = {
  title: string;
  description: string;
  groups: Array<{
    title: string;
    items: string[];
  }>;
};

const icons = [BriefcaseBusiness, Search, Megaphone, SwatchBook];

export default function ServicesSection({
  content,
}: {
  content: ServicesContent;
}) {
  return (
    <section className="py-14 sm:py-20 bg-slate-800/30 border-y border-slate-700/50 reveal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4 reveal reveal-delay-1">
          <span className="bg-linear-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
            {content.title}
          </span>
        </h2>
        <p className="text-slate-400 text-center mb-10 sm:mb-16 max-w-3xl mx-auto reveal reveal-delay-2">
          {content.description}
        </p>

        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
          {content.groups.map((group, index) => {
            const Icon = icons[index] ?? BriefcaseBusiness;
            return (
              <article
                key={group.title}
                className="rounded-2xl border border-slate-700 bg-slate-900/60 p-5 sm:p-6 reveal"
                style={{ transitionDelay: `${120 + index * 70}ms` }}
              >
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-400/35 bg-cyan-500/10">
                  <Icon className="h-5 w-5 text-cyan-300" />
                </div>
                <h3 className="text-white text-lg font-semibold mb-4">
                  {group.title}
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {group.items.join(" • ")}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
