import { LayoutTemplate, MessageCircleMore, PhoneCall } from "lucide-react";

type HowItWorksContent = {
  title: string;
  description: string;
  cta: string;
  steps: Array<{
    step: string;
    title: string;
    description: string;
  }>;
};

const stepConfig = [
  {
    Icon: LayoutTemplate,
    gradient: "from-cyan-500/20 to-blue-600/10",
    iconBg: "from-cyan-500 to-blue-600",
    badge: "from-cyan-500/15 to-blue-600/10 border-cyan-500/20 text-cyan-300",
    glow: "bg-cyan-500/10",
    connector: "from-cyan-400/40 to-blue-500/40",
  },
  {
    Icon: MessageCircleMore,
    gradient: "from-blue-500/20 to-violet-600/10",
    iconBg: "from-blue-500 to-violet-600",
    badge: "from-blue-500/15 to-violet-600/10 border-blue-500/20 text-blue-300",
    glow: "bg-blue-500/10",
    connector: "from-blue-400/40 to-violet-500/40",
  },
  {
    Icon: PhoneCall,
    gradient: "from-violet-500/20 to-purple-600/10",
    iconBg: "from-violet-500 to-purple-600",
    badge:
      "from-violet-500/15 to-purple-600/10 border-violet-500/20 text-violet-300",
    glow: "bg-violet-500/10",
    connector: null,
  },
];

export default function HowItWorksSection({
  content,
}: {
  content: HowItWorksContent;
}) {
  return (
    <section className="relative py-20 sm:py-28 overflow-hidden reveal">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-slate-950" />
        {/* Dot grid */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle, #475569 1px, transparent 1px)",
            backgroundSize: "32px 32px",
            opacity: 0.18,
            maskImage:
              "radial-gradient(ellipse 90% 70% at 50% 50%, black 20%, transparent 100%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 90% 70% at 50% 50%, black 20%, transparent 100%)",
          }}
        />
        {/* Diagonal accent lines */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(135deg, #334155 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            opacity: 0.07,
            maskImage:
              "radial-gradient(ellipse 80% 60% at 50% 50%, black 30%, transparent 100%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 80% 60% at 50% 50%, black 30%, transparent 100%)",
          }}
        />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-14 sm:mb-20 reveal reveal-delay-1">
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 mb-5">
            How It Works
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
            {content.title}
          </h2>
          <p className="text-slate-400 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            {content.description}
          </p>
        </div>

        {/* Steps */}
        <div className="relative flex flex-col gap-5 sm:gap-6">
          {content.steps.map((item, index) => {
            const { Icon, gradient, iconBg, badge, glow, connector } =
              stepConfig[index] ?? stepConfig[0];
            return (
              <div
                key={item.step}
                className="reveal"
                style={{ transitionDelay: `${index * 120}ms` }}
              >
                <div
                  className={`relative rounded-2xl border border-slate-700/60 bg-linear-to-br ${gradient} backdrop-blur-sm overflow-hidden group hover:border-slate-600 transition-all duration-300`}
                >
                  {/* Inner light gradient */}
                  <div className="absolute inset-0 bg-linear-to-br from-white/3 to-transparent pointer-events-none" />

                  {/* Glow spot */}
                  <div
                    className={`absolute -top-10 -right-10 w-40 h-40 rounded-full ${glow} blur-3xl pointer-events-none`}
                  />

                  <div className="relative p-5 sm:p-8">
                    {/* ── Mobile layout (< sm) ── */}
                    <div className="flex sm:hidden flex-col gap-4">
                      {/* Top row: step badge + icon */}
                      <div className="flex items-center justify-between">
                        <div
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border bg-linear-to-r ${badge} text-xs font-semibold`}
                        >
                          Step {item.step}
                        </div>
                        <div
                          className={`flex items-center justify-center w-12 h-12 rounded-xl bg-linear-to-br ${gradient} border border-white/10 shadow-inner shrink-0`}
                        >
                          <Icon
                            className="w-6 h-6 text-white/90"
                            strokeWidth={1.5}
                          />
                        </div>
                      </div>
                      {/* Text */}
                      <div>
                        <h3 className="text-white font-semibold text-lg mb-1.5 leading-snug">
                          {item.title}
                        </h3>
                        <p className="text-slate-400 text-sm leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    {/* ── Desktop / tablet layout (sm+) ── */}
                    <div className="hidden sm:flex items-center gap-8">
                      {/* Step chip */}
                      <div
                        className={`flex items-center gap-1.5 shrink-0 px-3 py-1.5 rounded-full border bg-linear-to-r ${badge} text-xs font-semibold`}
                      >
                        Step {item.step}
                      </div>

                      <div className="w-px self-stretch bg-slate-700/50 shrink-0" />

                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold text-xl mb-2 leading-snug">
                          {item.title}
                        </h3>
                        <p className="text-slate-400 text-base leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      <div className="w-px self-stretch bg-slate-700/50 shrink-0" />

                      {/* Icon */}
                      <div className="shrink-0">
                        <div
                          className={`flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br ${gradient} border border-white/10 shadow-inner`}
                        >
                          <Icon
                            className="w-8 h-8 text-white/90"
                            strokeWidth={1.5}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Connector arrow between cards — removed (handled outside) */}
                </div>

                {/* Connecting line */}
                {index < content.steps.length - 1 && (
                  <div className="flex justify-center my-2">
                    <div
                      className={`w-px h-8 bg-linear-to-b ${stepConfig[index].connector ?? "from-slate-600 to-slate-700"} opacity-50 rounded-full`}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center mt-12 sm:mt-16 reveal reveal-delay-3">
          <button className="btn-soft-motion w-full sm:w-auto px-8 py-4 bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-xl inline-flex items-center justify-center gap-2 text-base shadow-lg shadow-cyan-500/20">
            <MessageCircleMore className="w-5 h-5" />
            {content.cta}
          </button>
        </div>
      </div>
    </section>
  );
}
