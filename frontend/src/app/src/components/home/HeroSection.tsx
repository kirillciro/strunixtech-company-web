"use client";

import {
  LayoutTemplate,
  MessageCircleMore,
  MoveRight,
} from "lucide-react";

type HeroContent = {
  title: string;
  subtitle: string;
  description: string;
  ctaPrimary: string;
  ctaSecondary: string;
  trustedBy: string;
};

export default function HeroSection({ content }: { content: HeroContent }) {
  return (
    <section
      className="relative min-h-svh flex items-center justify-center pt-[calc(env(safe-area-inset-top)+5.5rem)] sm:pt-20 pb-10 sm:pb-20 overflow-hidden reveal"
      style={{ minHeight: "100dvh" }}
    >
      <div className="hero-tech-circuit" aria-hidden="true">
        <div className="hero-tech-grid" />
        <div className="hero-tech-strip hero-tech-strip-a" />
        <div className="hero-tech-strip hero-tech-strip-b" />
        <div className="hero-tech-cpu" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center w-full">
        <h1 className="text-[clamp(1.9rem,8.7vw,4.5rem)] font-bold mb-4 sm:mb-6 leading-[1.08] reveal reveal-delay-1">
          <span className="bg-linear-to-r from-cyan-300 via-blue-400 to-cyan-300 bg-clip-text text-transparent">
            {content.title}
          </span>
          <span className="block mt-1 text-white">{content.subtitle}</span>
        </h1>

        <p className="text-sm sm:text-lg md:text-2xl text-slate-300 mb-6 sm:mb-8 font-light max-w-2xl mx-auto reveal reveal-delay-2">
          {content.description}
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 reveal reveal-delay-3">
          <button className="btn-soft-motion w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-lg flex items-center justify-center gap-2">
            <MessageCircleMore className="w-5 h-5" />
            {content.ctaPrimary}
          </button>
          <button className="btn-soft-motion w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 border-2 border-slate-600 hover:border-cyan-400 text-white font-semibold rounded-lg hover:bg-cyan-400/10 flex items-center justify-center gap-2">
            <LayoutTemplate className="w-5 h-5" />
            {content.ctaSecondary}
            <MoveRight className="w-4 h-4" />
          </button>
        </div>

        {/* Trust Badge */}
        <div className="mt-8 sm:mt-12 pt-8 sm:pt-12 border-t border-slate-700/50 reveal reveal-delay-3 overflow-hidden">
          <p className="text-slate-400 text-sm mb-4">{content.trustedBy}</p>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-slate-500 text-xs sm:hidden">
            {["TechCorp", "StartupX", "Design Co", "WebAgency"].map(
              (company) => (
                <span key={company} className="font-medium tracking-wide">
                  {company}
                </span>
              ),
            )}
          </div>
          <div className="hidden sm:flex marquee-track gap-12 pr-12">
            {[
              "TechCorp",
              "StartupX",
              "Design Co",
              "WebAgency",
              "TechCorp",
              "StartupX",
              "Design Co",
              "WebAgency",
            ].map((company, index) => (
              <span
                key={`${company}-${index}`}
                className="text-slate-500 font-medium tracking-wide"
              >
                {company}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
