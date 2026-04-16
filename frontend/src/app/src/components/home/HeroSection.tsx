"use client";

import { LayoutTemplate, MessageCircleMore, MoveRight } from "lucide-react";
import { Sora } from "next/font/google";

const sora = Sora({ subsets: ["latin"], weight: ["700", "800"] });

type HeroContent = {
  title: string;
  subtitle: string;
  description: string;
  ctaPrimary: string;
  ctaSecondary: string;
  trustedBy: string;
  companies: string[];
};

export default function HeroSection({ content }: { content: HeroContent }) {
  return (
    <section
      className="relative min-h-svh flex items-center justify-center pt-[calc(env(safe-area-inset-top)+9rem)] sm:pt-36 pb-10 sm:pb-20 overflow-hidden reveal"
      style={{ minHeight: "100dvh" }}
    >
      {/* Background image */}
      <div className="absolute inset-0 -z-10">
        <img
          src="https://res.cloudinary.com/dhq3nxqt2/image/upload/q_auto/f_auto/v1775931486/com-plat/photo-1774953037913-af0cf688491a_fqg2cv.jpg"
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover object-center"
          loading="eager"
        />
        {/* Dark overlay so text remains readable */}
        <div className="absolute inset-0 bg-slate-950/72" />
        {/* Bottom fade into page background — tall so the transition to section 2 is seamless */}
        <div className="absolute inset-x-0 bottom-0 h-72 bg-linear-to-t from-slate-950 via-slate-950/80 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 sm:px-10 text-center">
        {/* Main heading — huge, display font */}
        <h1
          className={`${sora.className} reveal reveal-delay-1 mb-6 sm:mb-8 leading-[1.04] tracking-tight`}
          style={{ fontSize: "clamp(2.6rem, 7vw, 5.5rem)", fontWeight: 800 }}
        >
          <span className="bg-linear-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
            {content.title}
          </span>
          <span
            className="block text-white mt-2"
            style={{ fontSize: "clamp(2rem, 5.5vw, 4.2rem)", fontWeight: 700 }}
          >
            {content.subtitle}
          </span>
        </h1>

        <p className="reveal reveal-delay-2 text-base sm:text-xl md:text-2xl text-slate-100 mb-8 sm:mb-10 font-light max-w-2xl mx-auto leading-relaxed">
          {content.description}
        </p>

        {/* CTAs */}
        <div className="reveal reveal-delay-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4">
          <button className="btn-soft-motion w-full sm:w-auto px-7 sm:px-9 py-4 bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 text-base">
            <MessageCircleMore className="w-5 h-5" />
            {content.ctaPrimary}
          </button>
          <button className="btn-soft-motion w-full sm:w-auto px-7 sm:px-9 py-4 border-2 border-white/20 hover:border-cyan-400 text-white font-semibold rounded-xl hover:bg-cyan-400/10 flex items-center justify-center gap-2 text-base backdrop-blur-sm">
            <LayoutTemplate className="w-5 h-5" />
            {content.ctaSecondary}
            <MoveRight className="w-4 h-4" />
          </button>
        </div>

        {/* Trust Badge */}
        <div className="reveal reveal-delay-3 mt-12 sm:mt-16 pt-8 sm:pt-10 border-t border-white/10">
          <div className="flex items-center justify-center gap-4 mb-7">
            <div className="h-px w-12 bg-linear-to-r from-transparent to-slate-600" />
            <p className="text-slate-200 text-[10px] uppercase tracking-[0.25em] font-medium whitespace-nowrap">
              {content.trustedBy}
            </p>
            <div className="h-px w-12 bg-linear-to-l from-transparent to-slate-600" />
          </div>

          <div
            className="relative overflow-hidden"
            style={{
              maskImage:
                "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
              WebkitMaskImage:
                "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
            }}
          >
            <div className="flex marquee-track">
              {[...content.companies, ...content.companies].map(
                (company, i) => (
                  <span
                    key={i}
                    className="flex items-center gap-2 mx-3 shrink-0 px-5 py-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm text-white text-sm font-medium tracking-wide whitespace-nowrap hover:border-cyan-400/60 hover:bg-white/15 transition-colors duration-300"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/70 shrink-0" />
                    {company}
                  </span>
                ),
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
