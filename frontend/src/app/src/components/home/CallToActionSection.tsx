import { LayoutTemplate, MessageCircleMore } from "lucide-react";

type CtaContent = {
  title: string;
  description: string;
  primary: string;
  secondary: string;
  trust: string;
};

export default function CallToActionSection({
  content,
}: {
  content: CtaContent;
}) {
  return (
    <section className="relative py-14 sm:py-20 bg-slate-950 border-t border-slate-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-5 sm:mb-6 text-cyan-200">
          {content.title}
        </h2>

        <p className="text-base sm:text-xl text-slate-300 mb-7 sm:mb-8 max-w-2xl mx-auto">
          {content.description}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4">
          <button className="btn-soft-motion w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-lg flex items-center justify-center gap-2">
            <MessageCircleMore className="w-5 h-5" />
            {content.primary}
          </button>
          <button className="btn-soft-motion w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 border-2 border-slate-600 hover:border-cyan-400 text-white font-semibold rounded-lg hover:bg-cyan-400/10 flex items-center justify-center gap-2">
            <LayoutTemplate className="w-5 h-5" />
            {content.secondary}
          </button>
        </div>

        {/* Trust Message */}
        <p className="mt-8 text-slate-400 text-sm">{content.trust}</p>
      </div>
    </section>
  );
}
