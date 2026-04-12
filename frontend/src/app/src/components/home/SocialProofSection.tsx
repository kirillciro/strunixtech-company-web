"use client";

import { useEffect, useRef, useState } from "react";
import {
  BadgeCheck,
  BriefcaseBusiness,
  Gauge,
  Rocket,
  ShieldCheck,
  Smile,
} from "lucide-react";

type WhyChooseUsContent = {
  title: string;
  description: string;
  reasons: Array<{
    title: string;
    description: string;
  }>;
  stats: Array<{
    label: string;
    target: number;
    suffix?: string;
    prefix?: string;
  }>;
};

export default function SocialProofSection({
  content,
}: {
  content: WhyChooseUsContent;
}) {
  const statsRef = useRef<HTMLDivElement | null>(null);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [values, setValues] = useState<number[]>(() =>
    content.stats.map(() => 0),
  );

  const statIcons = [BriefcaseBusiness, Smile, Gauge, BadgeCheck];
  const reasonIcons = [Rocket, Gauge, ShieldCheck, BriefcaseBusiness];

  useEffect(() => {
    const node = statsRef.current;
    if (!node || hasAnimated) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (!entry?.isIntersecting) return;

        setHasAnimated(true);
        observer.disconnect();
      },
      { threshold: 0.25 },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [hasAnimated]);

  useEffect(() => {
    if (!hasAnimated) return;

    const duration = 5200;
    const start = performance.now();
    let frameId = 0;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      setValues(content.stats.map((stat) => Math.round(stat.target * eased)));

      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      }
    };

    frameId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frameId);
  }, [content.stats, hasAnimated]);

  return (
    <section className="py-14 sm:py-20 bg-slate-900/50 border-y border-slate-700/50 reveal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-10 sm:mb-16 reveal reveal-delay-1">
          <span className="bg-linear-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
            {content.title}
          </span>
        </h2>
        <p className="text-slate-400 text-center mb-10 sm:mb-16 max-w-3xl mx-auto reveal reveal-delay-2">
          {content.description}
        </p>

        {/* Reasons Grid */}
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 mb-10 sm:mb-16">
          {content.reasons.map((reason, index) => {
            const Icon = reasonIcons[index] ?? Rocket;
            return (
              <div
                key={reason.title}
                className="bg-slate-800/50 border border-slate-700 rounded-lg p-5 sm:p-8 hover:border-cyan-400/50 transition-colors reveal"
                style={{ transitionDelay: `${120 + index * 100}ms` }}
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-400/35 bg-cyan-500/10">
                  <Icon className="h-5 w-5 text-cyan-300" />
                </div>
                <div>
                  <p className="text-white font-semibold text-lg mb-2">
                    {reason.title}
                  </p>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    {reason.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Stats */}
        <div
          ref={statsRef}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 pt-8 sm:pt-16 border-t border-slate-700/50 reveal reveal-delay-2"
        >
          {content.stats.map((stat, index) => {
            const Icon = statIcons[index] ?? BadgeCheck;
            const currentValue = values[index] ?? 0;

            return (
              <div key={stat.label} className="text-center">
                <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-full border border-cyan-400/35 bg-cyan-500/10">
                  <Icon className="h-5 w-5 text-cyan-300" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold bg-linear-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent mb-2 tabular-nums">
                  {stat.prefix ?? ""}
                  {currentValue}
                  {stat.suffix ?? ""}
                </div>
                <p className="text-slate-400">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
