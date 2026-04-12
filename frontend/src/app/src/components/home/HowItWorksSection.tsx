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

export default function HowItWorksSection({
  content,
}: {
  content: HowItWorksContent;
}) {
  return (
    <section className="py-14 sm:py-20 reveal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4 reveal reveal-delay-1">
          <span className="bg-linear-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
            {content.title}
          </span>
        </h2>
        <p className="text-slate-400 text-center mb-10 sm:mb-16 max-w-2xl mx-auto reveal reveal-delay-2">
          {content.description}
        </p>

        {/* Process Steps */}
        <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
          {content.steps.map((item, index) => {
            const Icon =
              [LayoutTemplate, MessageCircleMore, PhoneCall][index] ??
              LayoutTemplate;
            return (
              <div
                key={item.step}
                className="relative group reveal"
                style={{ transitionDelay: `${140 + index * 110}ms` }}
              >
                {/* Connection line */}
                {parseInt(item.step) < 3 && (
                  <div className="hidden md:block absolute top-20 left-full w-6 h-0.5 bg-linear-to-r from-cyan-400 to-transparent"></div>
                )}

                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-5 sm:p-8 hover:border-cyan-400/50 transition-all hover:bg-slate-800">
                  <Icon className="w-10 h-10 mb-4 text-cyan-300 animate-tilt-sway" />
                  <div className="w-10 h-10 bg-linear-to-br from-cyan-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-2">
                    {item.title}
                  </h3>
                  <p className="text-slate-400 text-sm">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center mt-10 sm:mt-16 reveal reveal-delay-3">
          <button className="btn-soft-motion w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-lg inline-flex items-center justify-center gap-2">
            <MessageCircleMore className="w-5 h-5" />
            {content.cta}
          </button>
        </div>
      </div>
    </section>
  );
}
